/**
 * Intercala posts de dos grupos: por cada 2-3 del grupo A, inserta 1 del grupo B.
 * Si no hay suficientes del grupo B, se completa con los del grupo A.
 */
function interleavePosts(groupA, groupB) {
  const result = []
  let iA = 0
  let iB = 0
  let cycle = 0 // 0,1 = groupA; 2 = groupB; se repite

  while (iA < groupA.length || iB < groupB.length) {
    if (cycle < 2 && iA < groupA.length) {
      result.push(groupA[iA++])
    } else if (cycle === 2 && iB < groupB.length) {
      result.push(groupB[iB++])
    } else if (iA < groupA.length) {
      result.push(groupA[iA++])
    } else if (iB < groupB.length) {
      result.push(groupB[iB++])
    }
    cycle = (cycle + 1) % 3
  }

  return result
}

module.exports = {
  interleavePosts
}
