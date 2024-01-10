document.addEventListener('DOMContentLoaded', function() {
    const unstarButton = document.getElementById('unstar-btn');
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    let totalCount = 0;

    async function fetchStarredRepos(token, page = 1) {
        const response = await fetch(`https://api.github.com/user/starred?per_page=100&page=${page}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch starred repositories.');
        }
        return response.json();
    }

    async function countStarredRepositories(token) {
        loadingElement.style.display = 'block';
        let page = 1;
        let repos;
        totalCount = 0;

        do {
            repos = await fetchStarredRepos(token, page);
            totalCount += repos.length;
            page++;
        } while (repos.length === 100);

        loadingElement.style.display = 'none';
        resultsElement.textContent = `You have ${totalCount} starred repositories.`;
    }

    async function unstarRepo(token, owner, repo) {
        const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to unstar ${owner}/${repo}`);
        }
    }

    async function unstarAllRepos(token) {
        for (let i = 0; i < totalCount; i++) {
            const repo = await fetchStarredRepos(token, Math.ceil((i + 1) / 100));
            const { owner, name } = repo[i % 100];
            await unstarRepo(token, owner.login, name);
            loadingElement.value = i + 1;
        }
        resultsElement.textContent = 'All repositories have been unstarred.';
    }

    unstarButton.addEventListener('click', async function() {
        const token = document.getElementById('token-input').value;
        if (!token) {
            errorMessage.textContent = "Please enter your GitHub Personal Access Token.";
            return;
        }
        errorMessage.textContent = "";

        try {
            if (unstarButton.textContent === "Unstar Repos") {
                await countStarredRepositories(token);
                if (totalCount > 0) {
                    unstarButton.textContent = "Are you sure?";
                } else {
                    resultsElement.textContent = 'You have no starred repositories to unstar.';
                }
            } else if (unstarButton.textContent === "Are you sure?") {
                loadingElement.max = totalCount;
                loadingElement.value = 0;
                loadingElement.style.display = 'block';
                await unstarAllRepos(token);
                unstarButton.textContent = "Unstar Repos";
                loadingElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please check the console for more details.';
        }
    });
});
