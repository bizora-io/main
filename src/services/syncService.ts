export const syncData = async (data: any) => {
    const user = localStorage.getItem('nexus_user');
    if (!user) {
        console.warn('Sync skipped: No user logged in.');
        return false;
    }
    
    const userId = JSON.parse(user).id;
    console.log(`Attempting to sync data for user: ${userId}`);
    
    try {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(user).token}`
            },
            body: JSON.stringify({ userId, data })
        });
        
        if (response.ok) {
            console.log('Sync successful!');
            return true;
        } else {
            console.error('Sync failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Sync failed:', error);
        return false;
    }
};
