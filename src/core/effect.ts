import { type EffectCallback, useEffect } from './Dependency'

const effect = (callback: EffectCallback) => {
  useEffect(callback)
}

export default effect
