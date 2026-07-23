import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';

export const supabaseClient = createClient(
  supabaseUrl || 'https://ybynbgqyutgchokpiwez.supabase.co',
  supabaseAnonKey || 'sb_publishable_0kVLCgUAuv65zWJuqxoV6Q_gd0DqsKR'
);

/**
 * Storage Cleanup Helper
 * Extract storage path from public URL and delete from 'portfolio-assets' bucket
 */
export async function deleteStorageFileByUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('/portfolio-assets/')) {
    return;
  }
  try {
    const parts = url.split('/portfolio-assets/');
    if (parts.length > 1) {
      const filePath = parts[1];
      const { error } = await supabaseClient.storage.from('portfolio-assets').remove([filePath]);
      if (error) {
        console.warn('[Storage Cleanup] Error deleting file from storage:', error.message);
      } else {
        console.log('[Storage Cleanup] Successfully removed storage file:', filePath);
      }
    }
  } catch (err) {
    console.error('[Storage Cleanup] Exception:', err);
  }
}
