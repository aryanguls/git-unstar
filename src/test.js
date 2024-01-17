// token access to repo access is needed for this to work 

const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
    auth: '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'
})

console.log('numbers');
async function numStarredRepos() {

    let pagesRemaining = true;
    let page = 1; // Initialize page counter
    let output = [];

    while(pagesRemaining){
        const result = await octokit.request('GET /user/starred', {
            per_page: 100,
            page: page,
            headers: {
            'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        output = [...output, ...result.data]
        if (result.data.length < 100) {
            pagesRemaining = false;
        }else {
            page++; // Increment page counter
        }
    }
    console.log(output.length);
}

console.log('removing');
async function removeSingleStarredRepo(){
    const result = await octokit.request('DELETE /user/starred/{owner}/{repo}', {
        owner: 'Orbiter', // Repository owner's username
        repo: 'elasticsearch', // Repository name
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })
}

removeSingleStarredRepo();
numStarredRepos();
