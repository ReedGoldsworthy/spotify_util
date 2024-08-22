<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

<img src="https://github.com/user-attachments/assets/5b5d3eb0-0b83-4317-9a11-6ee2bc4a3784" width="100" height="100">

  

  <h3 align="center">Spotify-Util</h3>

  <p align="center">
    A utility tool for enhancing Spotify experiences by providing advanced playlist management, detailed data visualizations, and seamless playlist creation.
    
  <a href="https://spotify-util.onrender.com/">View Demo » (currently only allowing authorized users full website functionality)</a>
    .
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
![p1](https://github.com/user-attachments/assets/bda599db-97a7-4d00-b6e1-cba9d9b9e404)

**Spotify-Util** is a full-stack web application designed to enhance your Spotify experience by providing advanced playlist management and analysis features. Built with Node.js, Express, MongoDB, and React, this application leverages Spotify's OAuth2 for authentication and API access.

### Key Features

- **Spotify OAuth2 Integration**: Securely sign in with Spotify and manage your access tokens and playlists.
- **Track List Management**: View and sort your playlists in a tabular format, filter tracks by various attributes, and stage songs for further use.
- **Data Visualization**: Gain insights into your playlists with visualizations including genre breakdowns, top artists, release year graphs, and detailed attribute displays such as Danceability, Energy, and Popularity.
- **Playlist Creation**: Use the staged songs to create new playlists directly on Spotify, streamlining your music organization process.

### Purpose

Spotify-Util was developed to provide a more robust tool for analyzing, organizing, and creating playlists. By extending the capabilities of Spotify's built-in features, the application aims to give users a deeper understanding of their music and more control over their playlist creation.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section lists the major frameworks and libraries used in this project.

* <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js" width="150" height="40"/></a>
* <a href="https://expressjs.com/" target="_blank"><img src="https://img.shields.io/badge/Express.js-%23404d59?style=flat&logo=express&logoColor=%2361DAFB" alt="Express" width="150" height="40"/></a>
* <a href="https://www.mongodb.com/" target="_blank"><img src="https://img.shields.io/badge/MongoDB-%2347A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB" width="150" height="40"/></a>
* <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/React-%23282c34?style=flat&logo=react&logoColor=%61DAFB" alt="React" width="150" height="40"/></a>


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

* Download npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Create an account then get a Client ID & Client Secret at https://developer.spotify.com/dashboard
2. Clone the repo
   ```sh
   git clone https://github.com/ReedGoldsworthy/spotify_util.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your Client ID & Client Secret in `config.js`
   ```js
   const CLIENT_ID = 'ENTER YOUR CLIENT ID';
   const CLIENT_SECRET = 'ENTER YOUR CLIENT SECRET';
   ```
5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Demo Video:

### Track List
- The Track List page allows users to view and manage their playlist tracks in a sortable and filterable table format. Users can sort tracks by various attributes, apply filters to find specific songs, and stage playlists for further use, providing an organized and efficient way to interact with their music collection.
<p></p>

![stage1](https://github.com/user-attachments/assets/04a0dfe2-3ff1-4060-a643-9260296f7774)


### Data Visualization
- The Data Visualization page provides an interactive overview of playlist data, featuring visualizations such as pie charts for genre breakdowns, graphs for release years, and detailed attribute displays. It helps users analyze their playlists by offering insights into music characteristics like Danceability, Energy, Popularity and more.
<p></p>

![p1](https://github.com/user-attachments/assets/a43987fb-3f72-43da-bce5-57c55c80f179)

### Create
- The Create page allows users to assemble staged tracks into new playlists directly on Spotify. It provides an intuitive interface for selecting and organizing songs, facilitating the creation of personalized playlists based on user preferences.
<p></p>

![create](https://github.com/user-attachments/assets/9c792f1b-d8cd-4005-a067-c5140724b82d)


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Change FetchAudioFeatures to fetch multiple songs at once
- [ ] Make it so CreatePlaylist can create playlists bigger than 100 tracks
- [ ] Make application follow Spotify's extension request guidelines
- [ ] Change getAttributes in playlist service to only round values after the averages are computed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Reed Goldsworthy - Reedgoldsworthy2@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

I would like to acknowledge these music organization services. They were a big inspiration, and are useful tools for organizing music.

* https://www.chosic.com/spotify-playlist-analyzer/
* http://organizeyourmusic.playlistmachinery.com/index.html

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/ReedGoldsworthy/spotify_util/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/reed-goldsworthy-00893215a/


