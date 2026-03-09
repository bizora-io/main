export const syncData = async (data: any) => {
    const user = localStorage.getItem('nexus_user');
    if (!user) return;
    
    const userId = JSON.parse(user).id;
    
    try {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(user).token}`
            },
            body: JSON.stringify({ userId, data })
        });
        return response.ok;
    } catch (error) {
        console.error('Sync failed:', error);
        return false;
    }
};
