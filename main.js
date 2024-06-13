const bukus = [];
const RENDER_EVENT = "render-buku";
const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "BOOKSHELF_APPS";
let timestamp = new Date().getTime();

let stars = document.getElementsByClassName("star");
let output = document.getElementById("output");
let inputBookRating = document.getElementById("inputBookRating");
let n;

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBuku();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBuku() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const stringYear = document.getElementById("inputBookYear").value;
  const bookYear = parseInt(stringYear);
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  if (bookIsComplete) {
    const generatedID = generateId();
    const bukuObject = generateBukuObject(
      generatedID,
      bookTitle,
      bookAuthor,
      bookYear,
      true,
      " "
    );
    bukus.push(bukuObject);
  } else {
    const generatedID = generateId();
    const bukuObject = generateBukuObject(
      generatedID,
      bookTitle,
      bookAuthor,
      bookYear,
      false,
      " "
    );
    bukus.push(bukuObject);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBukuObject(id, title, author, year, isComplete, review) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
    review,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(bukus);
});

function makeBuku(bukuObject) {
  const imgElement = document.createElement("img");
  imgElement.src = `img/book.png`;
  imgElement.alt = bukuObject.title;
  imgElement.classList.add("book-thumbnail");

  const textTitle = document.createElement("h3");
  textTitle.innerText = bukuObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bukuObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bukuObject.year}`;

  const textReview = document.createElement("p");
  textReview.innerText = `Review: ${bukuObject.review}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const detailsContainer = document.createElement("div");
  detailsContainer.classList.add("details-container");
  detailsContainer.append(
    textTitle,
    textAuthor,
    textYear,
    textReview,
    buttonContainer
  );

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.setAttribute("id", `buku-${bukuObject.id}-${timestamp}`);
  container.append(imgElement, detailsContainer);

  if (bukuObject.isComplete && bukuObject.review == " ") {
    const belumSelesaiButton = document.createElement("button");
    belumSelesaiButton.classList.add("green");
    belumSelesaiButton.innerHTML = "Belum selesai dibaca";

    belumSelesaiButton.addEventListener("click", function () {
      undoFromCompleted(bukuObject.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerHTML = "Hapus buku";

    hapusButton.addEventListener("click", function () {
      removeFromCompleted(bukuObject.id);
    });

    const reviewButton = document.createElement("button");
    reviewButton.classList.add("blue");
    reviewButton.innerHTML = "Beri review buku";

    reviewButton.addEventListener("click", function () {
      addToReview(bukuObject.id);
    });

    reviewButton.addEventListener("click", function () {
      const reviewText = prompt("Beri review untuk buku ini:");
      if (reviewText !== null && reviewText.trim() !== "") {
        addToReview(bukuObject.id, reviewText);
      }
    });

    buttonContainer.append(belumSelesaiButton, hapusButton, reviewButton);
  } else if (!bukuObject.isComplete) {
    const selesaiButton = document.createElement("button");
    selesaiButton.classList.add("green");
    selesaiButton.innerHTML = "Selesai dibaca";

    selesaiButton.addEventListener("click", function () {
      addToCompleted(bukuObject.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerHTML = "Hapus buku";

    hapusButton.addEventListener("click", function () {
      removeFromCompleted(bukuObject.id);
    });

    buttonContainer.append(selesaiButton, hapusButton);
  } else if (bukuObject.isComplete && bukuObject.review != " ") {
    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerHTML = "Hapus buku";

    hapusButton.addEventListener("click", function () {
      removeFromCompleted(bukuObject.id);
    });

    buttonContainer.append(textReview, hapusButton);
  }

  return container;
}

function addToCompleted(bukuId) {
  const bukuTarget = findBuku(bukuId);

  if (bukuTarget == null) return;

  bukuTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addToReview(bookId, reviewText) {
  const bukuTarget = findBuku(bookId);

  if (bukuTarget == null) return;

  bukuTarget.review = reviewText;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBuku(bukuId) {
  for (const bukuItem of bukus) {
    if (bukuItem.id === bukuId) {
      return bukuItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(bukus);
  const uncompletedBUKUList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBUKUList.innerHTML = "";

  for (const bukuItem of bukus) {
    const bukuElement = makeBuku(bukuItem);
    uncompletedBUKUList.append(bukuElement);
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBUKUList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBUKUList.innerHTML = "";

  const completedBUKUList = document.getElementById("completeBookshelfList");
  completedBUKUList.innerHTML = "";

  const reviewedBUKUList = document.getElementById("reviewedBookshelfList");
  reviewedBUKUList.innerHTML = "";

  for (const bukuItem of bukus) {
    const bukuElement = makeBuku(bukuItem);
    if (!bukuItem.isComplete) uncompletedBUKUList.append(bukuElement);
    else if (bukuItem.isComplete && bukuItem.review == " ")
      completedBUKUList.append(bukuElement);
    else if (bukuItem.review != " ") reviewedBUKUList.append(bukuElement);
  }
});

function removeFromCompleted(bukuId) {
  const bukuTarget = findBukuIndex(bukuId);

  if (bukuTarget === -1) return;

  bukus.splice(bukuTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoFromCompleted(bukuId) {
  const bukuTarget = findBuku(bukuId);

  if (bukuTarget == null) return;

  bukuTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBuku(bukuId) {
  for (const bukuItem of bukus) {
    if (bukuItem.id === bukuId) {
      return bukuItem;
    }
  }
  return null;
}

function findBukuIndex(bukuId) {
  for (const index in bukus) {
    if (bukus[index].id === bukuId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bukus);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const buku of data) {
      bukus.push(buku);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const reviewedBookshelfList = document.getElementById(
    "reviewedBookshelfList"
  );

  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";
  reviewedBookshelfList.innerHTML = "";

  for (const bukuItem of bukus) {
    if (bukuItem.title.toLowerCase().includes(searchTitle)) {
      const bukuItemElement = makeBuku(bukuItem);
      if (!bukuItem.isComplete) {
        incompleteBookshelfList.append(bukuItemElement);
      } else if (bukuItem.isComplete && bukuItem.review === " ") {
        completeBookshelfList.append(bukuItemElement);
      } else if (bukuItem.isComplete && bukuItem.review != " ") {
        reviewedBookshelfList.append(bukuItemElement);
      }
    }
  }
}
