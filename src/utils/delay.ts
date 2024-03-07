export const delay = <T>(ms: number, result?: T) => new Promise(resolve => setTimeout(() => resolve(result), ms))
