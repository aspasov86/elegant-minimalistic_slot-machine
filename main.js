const Symbols = [
  "img/heart.png", "img/lightning.png", "img/star.png", "img/dog.png",
  "img/ice-cream.png", "img/leaf.png", "img/paw.png", "img/pencil.png"
];

const RESULT_PLACE_NUM = 3;
const IMAGES_PER_TRACK = 26;
const VISIBLE_ROWS_NUM = 3;

const Slots = $('.slot')
// Array which contains the images for each of the slots
const Images = new Array(Slots.length).fill([]).map(getDefaultImages)
// Audio effects for the slots
const audioElements = Slots.map(() => new Audio('audio/spin.wav'))

const spinDuration = new Promise((resolve) => {
  $(audioElements[0]).on('loadedmetadata', function () {
    resolve(Math.round(audioElements[0].duration) * 1000)
  })
})

let isFirstSpinDone = false;

// Randomizing and adding images to html (.slot)
Slots.each(function(index) {
  applyRandomImages($(this), Images[index], IMAGES_PER_TRACK - VISIBLE_ROWS_NUM);
})

$('#btn').on("click", startSlotMachine);

async function startSlotMachine() {
  $(this).prop('disabled', true);

  $('#wheel').addClass("spin");

  Slots.each(function() {
    reset($(this))
  })

  if (isFirstSpinDone) {
    Slots.each(function(index) {
      applyRandomImages($(this), Images[index], IMAGES_PER_TRACK - VISIBLE_ROWS_NUM);
    })
  }

  Slots.each(function(index) {
    setTimeout(() => {
      spin($(this))
      audioElements[index].play()
    }, index * 1000)
  })

  setTimeout(() => {
    $('#wheel').removeClass("spin");
    $(this).prop('disabled', false);
    //check results
    const result = []
    $('.result').each(function() {
      const imgPath = $(this).eq(0).attr("src")
      const match = imgPath.match(/\/([^.\/]+)\.png$/)
      result.push(match[1].toUpperCase())
    })
    console.log('result', result)

    isFirstSpinDone = true;
  }, await spinDuration + (Slots.length - 1) * 1000)
}

function getDefaultImages() {
  const imgsArray = []
  for (let index = IMAGES_PER_TRACK - 1; index < IMAGES_PER_TRACK; index--) {
    if (index < IMAGES_PER_TRACK - VISIBLE_ROWS_NUM) break;
    imgsArray[index] = Symbols[IMAGES_PER_TRACK - 1 - index]
  }
  return imgsArray;
}

function reset(element) {
  element.css({
    top: "-3805px"
  })
}

function spin(element) {
  element.animate({
    top: "-390px"
  }, 5000)
}

function getRandomNum(exceptNumArr) {
  let rand = Math.floor(Math.random() * Symbols.length);
  if (exceptNumArr.includes(rand)) {
    rand = getRandomNum(exceptNumArr);
  }
  return rand;
}

function randomizeImages(imagesArr, endIndexNum) {
  const randoms = [];
  for (let index = 0; index < endIndexNum; index++) {
    const random = getRandomNum(randoms.slice(-2));
    randoms.push(random);
    imagesArr[index] = Symbols[random];
  }
}

function addImagesToDOM(element, imagesArr) {
  const fragment = $(document.createDocumentFragment());
  for (let i = 0; i < imagesArr.length; i++) {
    const img = $('<img>', { src: imagesArr[i] })
    if (i === RESULT_PLACE_NUM) img.addClass('result');
    fragment.append(img);
  }
  element.empty().append(fragment);
}

function leaveVisibleSymbols(imagesArr, startIndex) {
  if (imagesArr[RESULT_PLACE_NUM] !== undefined) {
    for (let index = startIndex; index <= imagesArr.length - 1; index++) {
      imagesArr[index] = imagesArr[index - startIndex + RESULT_PLACE_NUM - 1]
    }
  }
}

function applyRandomImages(element, imagesArr, endIndexNum) {
  leaveVisibleSymbols(imagesArr, endIndexNum);
  randomizeImages(imagesArr, endIndexNum);
  addImagesToDOM(element, imagesArr);
}
