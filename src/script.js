import axios from 'axios';
import Notiflix, { Notify } from 'notiflix';

const form = document.getElementById('search-form');
const listGallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.js-load');
const buttonContainer = document.getElementById('container_button');
const buttonSubmit = document.querySelector('.button-submit');
const input = document.querySelector('.input-form');
let currentPage = 1;



input.addEventListener('input', onInputValue);

function onInputValue() {
  if (input.value.trim() !== '') {
    buttonSubmit.removeAttribute('disabled');
  }

  if (input.value.trim() === '') {
    listGallery.innerHTML = '';
    buttonSubmit.setAttribute('disabled', true);
    buttonContainer.style.display = 'none';
  }
}



loadMore.addEventListener('click', onClickButtonToLoad);

async function onClickButtonToLoad() {
  currentPage += 1;
  try {
    const data = await getGallery(form.searchQuery.value, currentPage);
    listGallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

    
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
   
  } catch (error) {
    console.log(error);
  }
}



form.addEventListener('submit', onHandlerClickButton);

async function onHandlerClickButton(event) {
  event.preventDefault();
  const { searchQuery } = event.currentTarget.elements;
  currentPage = 1;

  listGallery.innerHTML = '';
  loadMore.hidden = true;

  try {
    const data = await getGallery(searchQuery.value, currentPage);
    if (data.hits.length === 0) {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    listGallery.innerHTML = createMarkup(data.hits);

    if (data.hits.length !== 40) {
      loadMore.hidden = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMore.hidden = false;
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
  } catch (error) {
    console.log(error);
  }
}



const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35838965-00a6ae99c457ac18fcac9dde6';

async function getGallery(q, page = 1) {
  const params = new URLSearchParams({
    q: q,
    page,
    per_page: 40,
    safesearch: true,
    orientation: 'horizontal',
    image_type: 'photo',
  });


  try {
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}&${params}`);
    return response.data;
  } catch (error) {
    Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    throw new Error(error.response.statusText);
  }
}



function createMarkup(array) {
  return array
    .map(
      ({
        tags,
        webformatURL,
        views,
        downloads,
        likes,
        comments,
      }) => `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="320" height="200" class="card-photo"/>
  <div class="info">
    <p class="info-item"><b>Likes</b>${likes}</p>
    <p class="info-item"><b>Views</b>${views}</p>
    <p class="info-item"><b>Comments</b>${comments}</p>
    <p class="info-item"><b>Downloads</b>${downloads}</p>
  </div>
</div>
`
    )
    .join('');
}
