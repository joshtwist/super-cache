
import { createClient } from '@supabase/supabase-js'
import { BackgroundLoader, environment } from '@zuplo/runtime'

const supabaseUrl = 'https://gtpsqxkxklcnbskxdixl.supabase.co'
const supabaseKey = environment.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const cacheKeyLoader = new BackgroundLoader(loadCacheKeys , 1);

export interface CacheKey {
  customerId: string,
  applicationId: string,
  ttlSeconds: number,
  cacheKey: string
}

async function loadCacheKeys() :Promise<CacheKey[]> {
  
  const { data, error } = await supabase
  .from('cache-keys')
  .select('*');

  if (error) {
    throw error;
  }

  return data;
}

