//we call the url and with the object we indicate the method, this case to get info. and what to do incase of success or error
/*$.ajax('https://randomuser.me/api/',{
  method:'GET',
  success:function(data){
    console.log(data)
  },
  error:function(error){
    console.log(error)
  }
})*/



//NOW WE USE JAVASCRIPT VANILLA:
//We use fetch, this is a promise that calls an url. if its fulfilled we may get the data but we need to
//make other promise to translate it into javascript language.
//Finally we use catch in case some errors may occur.
fetch('https://randomuser.me/api/')
.then(response => response.json())
.then(data => console.log(data.results[0].name.first))
.catch(()=>console.log('Something went wrong'));

//USING ASYNC FUNCTIONS:
//Firstly I put the parenthesis so the function can auto-call itself.
//An async function is a promise, inside we can call other promises by the name await and also
//put them in variables.
//In this case I needed three genders so I need three different urls
//An async function inside the existing async function to make the three petitions three times.

(async function load(){
  async function getData(url){
    const response=await fetch(url);
    const data=await response.json();
    //MANAGE ERROR'S
    //So if there are no movies, it'll throw and object error
    //We catch the error in submit event, the property message.
    if(data.data.movie_count>0){
      return data;
    }
    throw new Error('Error 404, not founded')
  }

  //EVENT:
  //In the case of forms is common, the page refresh in each commit
  //To avoid this we use ".preventDefault"
  const $form=document.querySelector('#form');
  const $home=document.querySelector('#home');
  const $featuringContainer=document.querySelector('#featuring');

  //ATTRIBUTES THRU FUNCTION:
  //So as parameters we have the new element and an object with attributes and it's values
  //Now here with a for in, we run the object each property and well, we assign the attribute to the element created.
  function setAttributes($element,attributes){
    for(const attribute in attributes){
      $element.setAttribute(attribute,attributes[attribute])
    }
  }

  const BASE_API='https://yts.mx/api/v2/'
  const GENRE_URL='list_movies.json?genre='
  const FORM_URL='list_movies.json?limit=1&query_term='

  function featuringTemplate(peli){
    return (
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Found movie</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>
      `
    )
  }

  $form.addEventListener('submit', async (event)=>{
  //CSS:
  //Before everything is download form the API, we send the words submitted and also
  //We add to home the class "search-active"
    event.preventDefault();
    $home.classList.add('search-active');
  //CREATE ELEMENT AND ATTRIBUTE:
  //As you see below those are the methods to do so
  //Use a function to create several attributes
    const $loader=document.createElement('img');
    setAttributes($loader,{
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })
    $featuringContainer.append($loader);

    //FORM DATA:
    //Thanks to the attribute "name" in the inputs
    //We are able to get the value with the method '.get('name')' on the object "FormData"
    //We make async the event due  to the petition of data to compare
    //We make a call to the API, and we bring the movie with the exact name
    //We make a function to crate a Template
    //We use innerHTML to show the found movie.
    const data = new FormData($form);
    //DESTRUCTURING ASSIGNMENT
    //We declare the const
    //But we structure an Object
    //Now we destructuring it till reach the property we looked for
    //Optional. We can change the name of course, it's our variable after all.
    try{
      const {
        data:{
          movies: peli
        }
      }= await getData(`${BASE_API}${FORM_URL}${data.get('name')}`);
  
      const HTMLString = featuringTemplate(peli[0]);
      $featuringContainer.innerHTML=HTMLString;
    }catch(error){
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  })

  /*const { data: { movies: actionList} }= await getData(`${BASE_API}${GENRE_URL}action`);
  const { data: { movies: dramaList} }= await getData(`${BASE_API}${GENRE_URL}drama`);
  const { data: { movies: animationList} }=await getData(`${BASE_API}${GENRE_URL}animation`);
  console.log(actionList,dramaList,animationList)*/

//1TEMPLATES:
//Simply a piece of html in Javascript 
//We can make functions to implement new HTML in a dynamic way
//This templates are being created in JavaScript console not in the HTML
function videoItemTemplate(movie, category){
  //ID of the movie
  //We have the attributes data-sth 
  //In this template we assign as value of the attribute the id and category
  //So when we do click on them we can get that useful information...go showModal
  return (
    `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlaylistItem-image">
        <img src="${movie.medium_cover_image}">
      </div>
      <h4 class="primaryPlayListItem-title">
        ${movie.title}
      </h4>
    </div>`
  )
};

function createTemplate(HTMLString){
 //2CREATION DOM
  //Firstly we declare the container where our data will be
  //1. the piece of HTML we created is transform to HTML
  //2. We access that virtual DOM we created and put inside the Template
  //3. Now to put it in our DOM, we select the Container and use append so
  const html=document.implementation.createHTMLDocument();
  html.body.innerHTML=HTMLString;
  return html.body.children[0];
};

function addEventClick($element){
  $element.addEventListener('click',()=>{
    //CSS:
    //When we click one of this elements 
    //There will be and overlay "black background"--->add class active
    //There will be a modal, with title, picture and description of the movie.
    showModal($element);
  })
};

function renderMovieList(list,$container,category){
  $container.children[0].remove();
  list.forEach((movie)=>{
    const HTMLString = videoItemTemplate(movie,category);
    const movieElement=createTemplate(HTMLString)
  
    $container.append(movieElement);
    //ANIMATION:
    //Here we take the movie and add the animation in the class fadeIn
    //We use the event listener of "load" and the property "target"
    const image=movieElement.querySelector('img');
    image.addEventListener('load', (event) => event.target.classList.add('fadeIn') );

    addEventClick(movieElement);
    //EVENT JQUERY:
    //('.element') on ('click',function(){})
  })

};

//LOCAL STORAGE:
//So if the data exist in the cache, localStorage.setItem 
//then transform that json into object with property parse
//If there was no cache then 
//Take the data and transform it into Json with property stringify
//return the data.
async function cacheExist(category){
  const listName=`${category}List`;
  const cacheList= window.localStorage.getItem(listName);
  if(cacheList){
    return JSON.parse(cacheList);
  }
  const  { data: { movies: data} }=  await getData(`${BASE_API}${GENRE_URL}${category}`);
  window.localStorage.setItem(listName, JSON.stringify(data));

  return data;
}

//ANIMATION:
//So when we get one list we render that list first and then the next ones
//It makes the App faster.
// const { data: { movies: actionList} }= await getData(`${BASE_API}${GENRE_URL}action`);
const actionList= await cacheExist('action');
const $actionContainer=document.querySelector('#action');
renderMovieList(actionList,$actionContainer,'action');

const dramaList=await cacheExist('drama');
const $dramaContainer=document.querySelector('#drama');
renderMovieList(dramaList,$dramaContainer,'drama');

const animationList=await cacheExist('animation');
const $animationContainer=document.querySelector('#animation');
renderMovieList(animationList,$animationContainer,'animation');

console.log(actionList,dramaList,animationList);

//3REUSE FUNCTIONS:
//Now to make more clean the code. 
//1.Make a function with the Array of movies and the container to put it
//2.Make a function to make a template 
//3.Make a function to put that template into the DOM we using.

/*const $actionContainer=document.querySelector('#action');
renderMovieList(actionList,$actionContainer,'action');
const $dramaContainer=document.querySelector('#drama');
renderMovieList(dramaList,$dramaContainer,'drama');
const $animationContainer=document.querySelector('#animation');
renderMovieList(animationList,$animationContainer,'animation');*/

//SELECTORS:
//JQUERY:
//const $home=$('.home .list #item')---->Example.
//JSV:
// const $home=document.getElementById('modal')--->Example, it brings you one.
//                     .getElementByClassName('modal')--->Example, it brings you an array or one.
//                     .getElementByTagName('div')--->Example, it brings you an array.
//                     .querySelector('.modal')--->Example, it brings you first one.
//                     .querySelectorALl('.modal')--->Example, it brings you an array.

//These below are the Container to put the movies inside
/*const $actionContainer=document.querySelector('#action');
const $dramaContainer=document.querySelector('#drama');
const $animationContainer=document.querySelector('#animation');*/

//These selectors bellow are related to the div-modal.
const $modal=document.querySelector('#modal');
const $hideModal=document.querySelector('#hide-modal');
const $overlay=document.querySelector('#overlay');

const $modalTitle=$modal.querySelector('h1')
const $modalImg=$modal.querySelector('img')
const $modalDescription=$modal.querySelector('p')

  function findById(list,id){
    return list.find( movie => movie.id === parseInt(id,10) );
  }

function findMovie(id,category){
  switch(category){
    case 'action':{
      return findById(actionList,id);
    }
    case 'drama':{
      return findById(dramaList,id);
    }
    default:{
      return findById(animationList,id);
    }
  }
}

function showModal($element){
  //CSS:
  //We can add class to the elements to create interactions 
  //We can add styles to also make interactions
  $overlay.classList.add('active');
  $modal.style.animation='modalIn .8s forwards';
  //We get the from the data attribute the id and category we were looking for 
  //So now we must match that information in the array and take the positive one to show in the modal.
  //For that we use the function findMovie.
  //After we found it we show it in the modal.
  const id=$element.dataset.id;
  const category=$element.dataset.category;
  const data = findMovie(id,category);

  //????From where comes that data????
  //it can comes from a variable from the same Promise i made
  //This function is in every movie i got form the API 
  //so all have the const data when i did the destructuring assignment
  //When I run the array, each movie has a data---> That's my conclusion.
  $modalTitle.textContent=data.title;
  $modalImg.setAttribute('src', data.medium_cover_image);
  $modalDescription.textContent=data.description_full;
}

$hideModal.addEventListener('click',hideModal);
function hideModal(){
  $overlay.classList.remove('active');
  $modal.style.animation='modalOut .8s forwards';
}

//These below are selectors related to form,featuring and homw
// const $featuringContainer=document.querySelector('#featuring');
// const $form=document.querySelector('#form');
// const $home=document.querySelector('#home');


})()

//CHALLENGE:
//Left Playlist 

//API random user, random users.
//dataset, add films in the playlist movies.

//Bring new data from the API to refresh localStorage.