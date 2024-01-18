// url for api calling
const gitapi = "https://api.github.com/users/";
const main = document.querySelector("#main");
const repost = document.querySelector("#repost");
const form = document.querySelector("#form");
const pagination = document.querySelector("#pagination");
const loader = document.querySelector("#load");
const nav = document.querySelector("#nav");
// initialzing the requiremnets

let perPage = 9;
let currentPage = 1;
let size = 0;
let user = "";
// to understand the code go to the last function i.e. displayform
//function to show loader
const showLoader = () => {
    loader.style.display = "block";
};
//function to hide loader
const hideLoader = () => {
    loader.style.display = "none";
};

const getuser = async (username) => {
    showLoader();
    // api calling
    if(username=="")showAlert();
    const response = await fetch(gitapi + username);
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetTime = response.headers.get('X-RateLimit-Reset');

    console.log(`Rate Limit: ${limit}`);
    console.log(`Remaining Requests: ${remaining}`);
    console.log(`Reset Time: ${new Date(resetTime * 1000).toLocaleString()}`);

    if (!response.ok) {
        showAlert();
        hideLoader();
        return;
    }

    // Fetched the data
    const data = await response.json();

    // getting data of each repositries
    // api calling set to 100 perpage but it will reach api calling limit
    const repo = await fetch(`${data.repos_url}?per_page=100`);
    const reposData = await repo.json();
    let lc = data.location;
    let twit = data.location;
    if (lc == null) lc = "Location is not present";
    if (twit == null) twit = "Twitter name is not present";
    // intializing the size so that we can use it further
    size = reposData.length;
    const card = `
        <div class="card mb-3" style="max-width: 540px;">
            <div class="row no-gutters">
                <div class="col-md-4">
                    <img src="${data.avatar_url}" class="card-img" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${data.login}</h5>
                        <p class="card-text">${lc}</p>
                        <p class="card-text">Twitter: ${twit}</p>
                        <p class="card-text">
                            <small class="text-muted">
                                <a href="${data.html_url}" target="_blank">${data.url}</a>
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    // displaying user details
    main.innerHTML = card;
    // calling to get user repositries line 82
    getRepositoriesByPage(reposData, currentPage);
    // hideLoader();
};
const showAlert = () => {
    window.alert('Error: Enter the valid name.');
};
const getRepositoriesByPage = (reposData, page) => {
    // initialize the start and end index so that we can traverse the reposData   
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    // slicing reposdata to display only required repositries
    const visibleRepos = reposData.slice(startIdx, endIdx);
    // calling display repositries line 93
    displayRepositories(visibleRepos);
    renderPagination(reposData.length);
};

const displayRepositories = async (repos) => {
    showLoader();
    // displaying repositries
    let reposdetail = "<div class='row'>";
    for (let index = 0; index < repos.length; index++) {
        // Fetching the languages associated with the current repositry
        let tagsurl = repos[index].languages_url;
        const response = await fetch(tagsurl);
        const tagdata = await response.json();

        const languages = Object.keys(tagdata);

        if (index % 3 === 0 && index !== 0) {
            reposdetail += "</div><div class='row'>";
        }
        reposdetail += `
        <div class="col-md-4">
            <div class="card text-center mb-3">
                <div class="card-body">
                    <h5 class="card-title">${repos[index].name}</h5>
                    <p class="card-text">${repos[index].description}</p>`;
        // adding languages that is associated with the current repositries also added link of 
        // overapi show that it become responsive 
        for (let ind = 0; ind < languages.length; ind++) {
            let search = languages[ind].toLowerCase();
            reposdetail += `<a href="https://overapi.com/${search}" class="btn btn-primary mx-1 my-1" target="_blank">${languages[ind]}</a>`;
        }

        reposdetail += `
                    <a href="${repos[index].html_url}" class="btn btn-primary mx-1 my-1" target="_blank">View Repository</a>
                </div>
            </div>
        </div>
    `;
    }
    reposdetail += "</div>";
    repost.innerHTML = reposdetail;
    hideLoader();
};

const renderPagination = (totalRepos) => {
    // to display the current page number and prev next buttons
    // counting total number of pages required
    const totalPages = Math.ceil(totalRepos / perPage);
    const paginationHtml = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" tabindex="-1" onclick="handlePrevClick()">Previous</a>
                </li>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => `
                    <li class="page-item ${pageNum === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${pageNum})">${pageNum}</a>
                    </li>
                `)}
                
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="handleNextClick()">Next</a>
                </li>
            </ul>
        </nav>
    `;
    pagination.innerHTML = paginationHtml;
};


const changePage = (newPage) => {
    showLoader();
    currentPage = newPage;
    getuser(user);
};

const handlePrevClick = () => {
    showLoader();
    if (currentPage > 1) {
        currentPage--;
        getuser(user);
    }
};

const handleNextClick = () => {
    showLoader();
    const totalPages = Math.ceil(size / perPage);
    if (currentPage < totalPages) {
        getuser(user);
        currentPage++;
    }
};

const getusername = () => {
    showLoader();
    let username = document.getElementById('uname').value;
    let pgno = 9;
    pgno = document.getElementById('numberofrep').value;
    if (!pgno)
        pgno = 9;
    // intializing the username to global variable user so that we can use the name further 
    user = username;
    perPage = pgno;
    // calling the getuser to get details of the user line 26
    getuser(username);
}
// navbar 

const navbar = () => {
    const nv = `
    <nav class="navbar fixed-top navbar-dark bg-dark ">
        <a class="navbar-brand" href="" >GitHub Insight</a>
      </nav>
    `
    nav.innerHTML = nv;
}
navbar();


// this is the start point of website  
const displayform = () => {
    // function to get user name
    hideLoader();
    const formHtml = `
        <form onsubmit="event.preventDefault(); getusername();">
        <div><h4>Enter the details</h4></div>
            <div class="form-group">
                <label >Name</label>
                <input type="name" class="form-control" name="name" id="uname" aria-describedby="name" placeholder="Enter Name">
            </div>
            <div class="form-group">
                <label >Number of Repositries/Page</label>
                <input type="name" class="form-control" name="numberofrep" id="numberofrep" aria-describedby="name" placeholder="Enter Number of Repositries">
            </div>
            <button type="submit" class="btn btn-primary">Search Name</button>
        </form>
    `;
    // onsubmit going to getusername function which is at the line 181
    form.innerHTML = formHtml;
}
displayform();

