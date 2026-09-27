# SENTINEL-I4C: Algorithmic Formulations & Mathematical Models

## 1. TGN Trace Engine (Prototype Temporal Graph Scoring)

The Temporal Graph Network (TGN) trace engine operates on the dynamic graph $\mathcal{G}(t) = (\mathcal{V}(t), \mathcal{E}(t))$. For each transaction $e = (u, v, t, a, c)$ from source node $u$ to target mule $v$ at time $t$ with amount $a$ and channel $c$, we compute a feature vector:

$$\mathbf{x}_e = \left[ \frac{a}{a_{\max}}, \frac{\Delta t}{60}, \frac{\deg(v)}{10}, \frac{N_{\text{tx}}(v)}{10}, \frac{h}{h_{\max}}, c_{\text{code}}, \frac{a}{\Delta t} \right]^T$$

A multi-layer neural projector with ReLU non-linearities and dropout outputs raw transition logits:

$$\mathbf{z} = \mathbf{W}_2 \cdot \text{ReLU}(\mathbf{W}_1 \cdot \mathbf{x}_e + \mathbf{b}_1) + \mathbf{b}_2$$

The transition probability over candidate terminal points $c_i \in \mathcal{C}$ is normalized via Softmax:

$$P_{\text{TGN}}(c_i \mid \mathcal{G}(t)) = \frac{\exp(z_i + \alpha \cdot \text{risk}(c_i) + \beta \cdot \text{hist}(c_i))}{\sum_{j} \exp(z_j + \alpha \cdot \text{risk}(c_j) + \beta \cdot \text{hist}(c_j))}$$

Shannon entropy quantifies model uncertainty:

$$H(P) = - \sum_{i} P_{\text{TGN}}(c_i) \log_2 P_{\text{TGN}}(c_i)$$

---

## 2. Trace Confidence Routing Formulation

Confidence $\mathcal{C}_{\text{trace}} \in [0, 1]$ is evaluated using five dynamic graph features:

$$\mathcal{C}_{\text{trace}} = w_1 S_{\text{hops}} + w_2 S_{\text{recency}} + w_3 S_{\text{novelty}} + w_4 S_{\text{entropy}} + w_5 S_{\text{connectivity}}$$

Where:
- $S_{\text{hops}} = \min(1.0, h / 4.0)$
- $S_{\text{recency}} = 0.85$ (if $h \ge 3$) else $0.35$
- $S_{\text{novelty}} = 1.0 - \text{unseen\_ratio}$
- $S_{\text{entropy}} = \max(0.1, 1.0 - H(P) / 2.2)$
- $S_{\text{connectivity}} = 1.0 - 0.8 \cdot (\text{noise\_tx} / \text{total\_tx})$

### Dynamic Weight Allocation:
| Confidence Tier | Criteria | $w_t$ (TGN) | $w_k$ (ST-KDE) | $w_g$ (ST-GCN) | Routing Decision |
|---|---|---|---|---|---|
| **HIGH** | $\mathcal{C} \ge 0.65$ | 0.70 | 0.18 | 0.12 | Primary TGN Engine |
| **MEDIUM** | $0.40 \le \mathcal{C} < 0.65$ | 0.50 | 0.28 | 0.22 | Calibrated Fusion |
| **LOW** | $\mathcal{C} < 0.40$ | 0.25 | 0.45 | 0.30 | Geo-Temporal Fallback |

---

## 3. Geo-Temporal Engine (ST-KDE + ST-GCN)

### Spatio-Temporal Kernel Density Estimation (ST-KDE)
Evaluates spatial clustering of previous fraud cash-outs around candidate point $\mathbf{x}_i$:

$$\text{ST-KDE}(\mathbf{x}_i, t) = \sum_{j=1}^{M} K_{\text{spatial}}\left(\frac{d(\mathbf{x}_i, \mathbf{x}_j)}{b_s}\right) \cdot K_{\text{temporal}}\left(\frac{t - t_j}{b_t}\right) \cdot \omega_j$$

Where:
- $K_{\text{spatial}}(u) = \exp\left(-\frac{1}{2} u^2\right)$ (Gaussian spatial kernel)
- $K_{\text{temporal}}(\tau) = 2^{-\tau / t_{1/2}}$ (Half-life decay, $t_{1/2} = 48\text{ hrs}$)
- $d(\mathbf{x}_i, \mathbf{x}_j)$ is Great-Circle Haversine distance in km.

### Spatio-Temporal Graph Convolutional Network (ST-GCN)
Performs localized message passing over proximity edges ($d_{ij} \le 12\text{ km}$):

$$\mathbf{h}_i^{(l+1)} = \sigma\left( \mathbf{W}_{\text{gcn}} \cdot \left( \sum_{j \in \mathcal{N}(i)} \frac{1}{\max(1, d_{ij})} \mathbf{h}_j^{(l)} \right) + \mathbf{b} \right) \cdot \Phi_{\text{temporal}}(t, \text{type}_i)$$

$\Phi_{\text{temporal}}$ models channel operating affinities (ATM 24/7 night peak vs CSP 10:00–18:00 banking hours).

---

## 4. Fusion & Temperature Calibration

The ensemble score for candidate location $i$ is:

$$S_{\text{fused}}(i) = w_t P_{\text{TGN}}(i) + w_k \text{ST-KDE}(i) + w_g \text{ST-GCN}(i)$$

Calibrated with temperature scaling parameter $T = 1.2$:

$$P_{\text{final}}(i) = \frac{\exp\left(S_{\text{fused}}(i) / T\right)}{\sum_{k=1}^{K} \exp\left(S_{\text{fused}}(k) / T\right)}$$

---

## 5. Intervention Expected Recovery Equation

For candidate terminal $i$, expected financial recovery is:

$$\mathbb{E}[\text{Recovery}_i] = P_{\text{final}}(i) \times A_{\text{predicted}} \times P_{\text{intercept}}(i)$$

Where intercept success probability depends on patrol vehicle dispatch ETA:

$$P_{\text{intercept}}(i) = 0.5 \left( 1 - \frac{d_i}{25} \right) + 0.5 \left( 1 - \frac{\text{ETA}_i}{35} \right)$$
