/**
 * Supabase Data Layer for Public Portfolio
 */
window.PortfolioData = {
  // 1. Fetch Site Settings
  async getSiteSettings() {
    if (!window.supabaseClient) return null;
    try {
      const { data, error } = await window.supabaseClient
        .from('site_settings')
        .select('*');
      
      if (error || !data) throw error;
      
      const settingsMap = {};
      data.forEach(item => {
        settingsMap[item.key] = typeof item.value === 'string' ? item.value : item.value;
      });
      return settingsMap;
    } catch (err) {
      console.warn('[PortfolioData] Error fetching site settings:', err);
      return null;
    }
  },

  // 2. Fetch Published Projects
  async getProjects() {
    if (!window.supabaseClient) return null;
    try {
      const { data, error } = await window.supabaseClient
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[PortfolioData] Error fetching projects:', err);
      return null;
    }
  },

  // 3. Fetch Single Project by Slug or ID (including media)
  async getProjectBySlugOrId(idOrSlug) {
    if (!window.supabaseClient || !idOrSlug) return null;
    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
      
      let data = null;
      if (isUuid) {
        const res = await window.supabaseClient.from('projects').select('*').eq('id', idOrSlug).eq('is_published', true).maybeSingle();
        data = res.data;
      } else {
        const res = await window.supabaseClient.from('projects').select('*').eq('slug', idOrSlug).eq('is_published', true).maybeSingle();
        data = res.data;
        if (!data) {
          // Retry matching by id in case UUID was passed as slug
          const retryRes = await window.supabaseClient.from('projects').select('*').eq('id', idOrSlug).eq('is_published', true).maybeSingle();
          data = retryRes.data;
        }
      }

      if (!data) return null;

      // Fetch project media
      const { data: mediaData } = await window.supabaseClient
        .from('project_media')
        .select('*')
        .eq('project_id', data.id)
        .order('sort_order', { ascending: true });

      return {
        ...data,
        media: mediaData || []
      };
    } catch (err) {
      console.warn('[PortfolioData] Error fetching project details:', err);
      return null;
    }
  },


  // 4. Fetch Published Team Members
  async getTeamMembers() {
    if (!window.supabaseClient) return null;
    try {
      const { data, error } = await window.supabaseClient
        .from('team_members')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[PortfolioData] Error fetching team members:', err);
      return null;
    }
  }
};
