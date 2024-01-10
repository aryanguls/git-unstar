const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
    auth: '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'
});

async function getAllStarredRepos() {
    let pagesRemaining = true;
    let page = 1;
    let starredRepos = [];

    while (pagesRemaining) {
        const result = await octokit.request('GET /user/starred', {
            per_page: 100,
            page: page,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        starredRepos = [...starredRepos, ...result.data];
        if (result.data.length < 100) {
            pagesRemaining = false;
        } else {
            page++;
        }
    }
    return starredRepos.map(repo => repo.full_name);
}

async function unstarRepo(fullName) {
    const [owner, repo] = fullName.split('/');
    await octokit.request('DELETE /user/starred/{owner}/{repo}', {
        owner,
        repo,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

async function unstarAllRepos() {
    const reposToUnstar = await getAllStarredRepos();
    for (const repoFullName of reposToUnstar) {
        await unstarRepo(repoFullName);
        console.log(`Unstarred ${repoFullName}`);
    }
}

unstarAllRepos();
