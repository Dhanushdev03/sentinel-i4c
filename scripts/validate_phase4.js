import { CASES } from '../src/data/mockData.ts'
import { computePrediction, computeTraceRouter } from '../src/utils/predictionEngine.ts'

console.log('====================================================')
console.log('SENTINEL-I4C PHASE 4: MATHEMATICAL ENGINE VALIDATION')
console.log('====================================================\n')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    passed++
    console.log(`  [PASS] ${message}`)
  } else {
    failed++
    console.error(`  [FAIL] ${message}`)
  }
}

// TEST 1: Trace Origin of Predictions (Req 1)
console.log('\n--- TEST 1: TRACE ORIGIN OF PREDICTIONS ---')
const testCase = CASES[0]
const pred1 = computePrediction(testCase, 489201, 'SCENARIO_A', false)

assert(pred1.id && pred1.id.startsWith('PRED-'), 'Prediction has valid prediction_id')
assert(pred1.caseId === testCase.id, 'Prediction links to case_id')
assert(pred1.timestamp, 'Prediction has timestamp')
assert(pred1.modelVersion === 'SENTINEL-TGN-v0.4.2-PROTOTYPE', 'Prediction has model_version')
assert(typeof pred1.scores.fusionScore === 'number' && pred1.scores.fusionScore > 0, 'Prediction has fusion_score')
assert(pred1.traceConfidence === 'HIGH', 'Prediction has trace confidence')
assert(pred1.locations.length >= 3, 'Prediction has at least 3 candidate locations')
assert(pred1.timeWindowMin > 0 && pred1.timeWindowMax > pred1.timeWindowMin, 'Prediction has valid time window')
assert(pred1.amountMin > 0 && pred1.amountMax > pred1.amountMin, 'Prediction has valid amount interval')

// TEST 2: Model Score Breakdown (Req 2)
console.log('\n--- TEST 2: MODEL SCORE BREAKDOWN ---')
const sc = pred1.scores
console.log(`  Temporal Graph Score:       ${(sc.temporalGraphScore * 100).toFixed(1)}%`)
console.log(`  Geo-Temporal Score:         ${(sc.geoTemporalScore * 100).toFixed(1)}%`)
console.log(`  Historical Synthetic Pattern:${(sc.historicalPatternScore * 100).toFixed(1)}%`)
console.log(`  Transaction Velocity:       ${(sc.transactionVelocityScore * 100).toFixed(1)}%`)
console.log(`  Geographic Proximity:       ${(sc.geographicProximityScore * 100).toFixed(1)}%`)
console.log(`  Fusion Score:               ${(sc.fusionScore * 100).toFixed(1)}%`)

assert(sc.temporalGraphScore > 0 && sc.temporalGraphScore <= 1, 'Temporal graph score between 0 and 1')
assert(sc.geoTemporalScore > 0 && sc.geoTemporalScore <= 1, 'Geo-temporal score between 0 and 1')
assert(sc.historicalPatternScore > 0 && sc.historicalPatternScore <= 1, 'Historical pattern score between 0 and 1')
assert(sc.transactionVelocityScore > 0 && sc.transactionVelocityScore <= 1, 'Transaction velocity score between 0 and 1')
assert(sc.geographicProximityScore > 0 && sc.geographicProximityScore <= 1, 'Geographic proximity score between 0 and 1')
assert(sc.fusionScore > 0 && sc.fusionScore <= 1, 'Fusion score between 0 and 1')

// TEST 3: Fusion Calculation Transparency (Req 3)
console.log('\n--- TEST 3: FUSION CALCULATION TRANSPARENCY ---')
const expectedSum = sc.tgnComponent + sc.stKdeComponent + sc.stGcnComponent
const calibrated = Number((expectedSum * sc.calibrationFactor).toFixed(3))
console.log(`  TGN Component:  ${sc.temporalGraphScore.toFixed(3)} × ${sc.tgnWeight.toFixed(2)} = ${sc.tgnComponent.toFixed(4)}`)
console.log(`  ST-KDE Comp:    ${sc.geoTemporalScore.toFixed(3)} × ${sc.stKdeWeight.toFixed(2)} = ${sc.stKdeComponent.toFixed(4)}`)
console.log(`  ST-GCN Comp:    ${sc.historicalPatternScore.toFixed(3)} × ${sc.stGcnWeight.toFixed(2)} = ${sc.stGcnComponent.toFixed(4)}`)
console.log(`  Calibration:    × ${sc.calibrationFactor.toFixed(3)}`)
console.log(`  Calibrated Res: ${calibrated.toFixed(3)} (Reported: ${sc.fusionScore.toFixed(3)})`)

assert(Math.abs(sc.tgnWeight + sc.stKdeWeight + sc.stGcnWeight - 1.0) < 0.001, 'Fusion weights sum to 1.0')
assert(Math.abs(calibrated - sc.fusionScore) < 0.002, 'Fusion score matches ensemble formula')

// TEST 4: Trace Router Proof (Req 4)
console.log('\n--- TEST 4: TRACE ROUTER PROOF ---')
const router = pred1.router
console.log(`  Hop Evidence:  ${router.hopEvidence}`)
console.log(`  Recency:       ${router.recencyScore}`)
console.log(`  Connectivity:  ${router.connectivityScore}`)
console.log(`  Novelty:       ${router.nodeNoveltyScore}`)
console.log(`  Uncertainty:   ${router.uncertaintyScore}`)
console.log(`  Composite:     ${router.compositeConfidence}`)
console.log(`  Routing:       ${router.routingDecision}`)

const manualComposite = Number((
  router.hopEvidence * 0.25 +
  router.recencyScore * 0.25 +
  router.connectivityScore * 0.20 +
  router.nodeNoveltyScore * 0.15 +
  (1 - router.uncertaintyScore) * 0.15
).toFixed(3))

assert(Math.abs(manualComposite - router.compositeConfidence) < 0.002, 'Trace confidence matches 5-factor formula')
assert(router.compositeConfidence >= 0.75 ? router.routingDecision === 'TGN PRIMARY' : true, 'High confidence routes to TGN PRIMARY')

// TEST 5: Reproducibility (Req 8)
console.log('\n--- TEST 5: PREDICTION REPRODUCIBILITY ---')
const pred1_repeat = computePrediction(testCase, 489201, 'SCENARIO_A', false)
const pred2_diffSeed = computePrediction(testCase, 999123, 'SCENARIO_A', false)

assert(pred1.scores.fusionScore === pred1_repeat.scores.fusionScore, 'Exact same seed yields identical fusion score')
assert(pred1.timeWindowMin === pred1_repeat.timeWindowMin, 'Exact same seed yields identical time window')
assert(pred1.amountDetails.estimatedCashOut === pred1_repeat.amountDetails.estimatedCashOut, 'Exact same seed yields identical amount')
assert(pred1.reproducibility.runId === pred1_repeat.reproducibility.runId, 'Exact same seed yields identical runId')
assert(pred1.scores.fusionScore !== pred2_diffSeed.scores.fusionScore, 'Different seed yields varied fusion score')

// TEST 6: Adversarial Demo (Req 15)
console.log('\n--- TEST 6: ADVERSARIAL DEMO & CONFIDENCE DEGRADATION ---')
const pred_clean = computePrediction(testCase, 489201, 'SCENARIO_A', false)
const pred_noisy = computePrediction(testCase, 489201, 'SCENARIO_A', true)

console.log(`  Clean Trace Confidence: ${(pred_clean.router.compositeConfidence * 100).toFixed(1)}% (${pred_clean.router.routingDecision})`)
console.log(`  Noisy Trace Confidence: ${(pred_noisy.router.compositeConfidence * 100).toFixed(1)}% (${pred_noisy.router.routingDecision})`)

assert(pred_clean.router.compositeConfidence > pred_noisy.router.compositeConfidence, 'Adversarial noise degrades confidence')
assert(pred_noisy.router.compositeConfidence <= 0.65, 'Noisy confidence drops to ~61%')
assert(pred_noisy.router.routingDecision === 'FUSION BALANCED', 'Routing downgrades to FUSION BALANCED under noise')

// TEST 7: Scenarios A-E (Req 14)
console.log('\n--- TEST 7: SCENARIOS A THROUGH E ---')
const scA = computePrediction(testCase, 489201, 'SCENARIO_A', false)
const scB = computePrediction(testCase, 489201, 'SCENARIO_B', false)
const scC = computePrediction(testCase, 489201, 'SCENARIO_C', false)
const scD = computePrediction(testCase, 489201, 'SCENARIO_D', false)
const scE = computePrediction(testCase, 489201, 'SCENARIO_E', false)

console.log(`  Scenario A (Clear Chain):     ${(scA.scores.fusionScore * 100).toFixed(1)}% [${scA.traceConfidence}]`)
console.log(`  Scenario B (Noisy Network):   ${(scB.scores.fusionScore * 100).toFixed(1)}% [${scB.traceConfidence}]`)
console.log(`  Scenario C (Multi-Outlet):    ${(scC.scores.fusionScore * 100).toFixed(1)}% [${scC.traceConfidence}]`)
console.log(`  Scenario D (Adversarial):     ${(scD.scores.fusionScore * 100).toFixed(1)}% [${scD.traceConfidence}]`)
console.log(`  Scenario E (Low Confidence):  ${(scE.scores.fusionScore * 100).toFixed(1)}% [${scE.traceConfidence}]`)

assert(scA.traceConfidence === 'HIGH', 'Scenario A has HIGH confidence')
assert(scE.traceConfidence === 'LOW', 'Scenario E has LOW confidence')
assert(scE.scores.fusionScore < 0.55, 'Scenario E does NOT produce artificially high prediction')

// TEST 8: Dynamic Recovery Formula (Req 12)
console.log('\n--- TEST 8: DYNAMIC RECOVERY FORMULA ---')
const rec = pred1.recoveryDetails
console.log(`  Formula: ${rec.formulaDisplay}`)
console.log(`  Computed: ₹${rec.expectedRecovery}`)

const manualRecovery = Math.round(rec.probability * rec.estimatedAmount * rec.interceptSuccessProbability)
assert(Math.abs(manualRecovery - rec.expectedRecovery) <= 1, 'Expected recovery dynamically matches probability × amount × intercept')

// TEST 9: Prediction Validation Ground Truth (Req 13)
console.log('\n--- TEST 9: PREDICTION VALIDATION GROUND TRUTH ---')
const val = pred1.validation
console.log(`  Predicted Loc: ${val.predictedLocation} | Actual: ${val.actualLocation}`)
console.log(`  Spatial Error: ${val.spatialErrorKm} km | Time Error: ${val.timeErrorMin} min | Amount Error: ₹${val.amountError}`)
console.log(`  Outcome: ${val.outcome}`)

assert(val.spatialErrorKm >= 0, 'Spatial error is non-negative')
assert(val.timeErrorMin >= 0, 'Time error is non-negative')
assert(val.amountError >= 0, 'Amount error is non-negative')
assert(['HIT', 'PARTIAL', 'MISS'].includes(val.outcome), 'Outcome is HIT, PARTIAL, or MISS')

// TEST 10: Multi-Case Diversity across 10 Synthetic Cases (Req 23)
console.log('\n--- TEST 10: MULTI-CASE DIVERSITY ACROSS 10 CASES ---')
const testedCases = CASES.slice(0, 10)
const predictions = testedCases.map((c, i) => computePrediction(c, 489201 + i, 'SCENARIO_A', false))

const locations = new Set(predictions.map(p => p.locations[0].name))
const scores = new Set(predictions.map(p => (p.scores.fusionScore * 100).toFixed(1)))
const confidences = new Set(predictions.map(p => p.traceConfidence))

console.log(`  Evaluated: ${testedCases.length} cases`)
console.log(`  Unique Top Locations: ${locations.size} / ${testedCases.length}`)
console.log(`  Unique Fusion Scores: ${scores.size} / ${testedCases.length}`)
console.log(`  Observed Confidence Levels: ${Array.from(confidences).join(', ')}`)

testedCases.forEach((c, i) => {
  const p = predictions[i]
  console.log(`    Case ${c.id.padEnd(20)} | ${c.fraudType.padEnd(18)} | Hops: ${c.hops} | ${(p.scores.fusionScore * 100).toFixed(1)}% | ${p.traceConfidence.padEnd(6)} | ${p.router.routingDecision.padEnd(20)} | ${p.locations[0].name}`)
})

assert(locations.size >= 5, 'Diverse top locations across cases')
assert(scores.size >= 8, 'Diverse model scores across cases')
assert(confidences.size >= 2, 'Multiple confidence tiers represented across cases')

console.log('\n====================================================')
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`)
console.log('====================================================')

if (failed > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
