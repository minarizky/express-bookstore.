// tests/books.test.js

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Set the environment to test
process.env.NODE_ENV = "test";

// Sample book for testing
const sampleBook = {
  isbn: "1234567890",
  amazon_url: "http://a.co/sample",
  author: "Test Author",
  language: "english",
  pages: 100,
  publisher: "Test Publisher",
  title: "Test Book",
  year: 2021
};

beforeAll(async () => {
  await db.query("CREATE TABLE IF NOT EXISTS books (isbn TEXT PRIMARY KEY, amazon_url TEXT, author TEXT, language TEXT, pages INTEGER, publisher TEXT, title TEXT, year INTEGER)");
});

beforeEach(async () => {
  await db.query("INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [sampleBook.isbn, sampleBook.amazon_url, sampleBook.author, sampleBook.language, sampleBook.pages, sampleBook.publisher, sampleBook.title, sampleBook.year]);
});

afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", () => {
  test("Gets a list of all books", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0]).toHaveProperty("isbn");
  });
});

describe("GET /books/:isbn", () => {
  test("Gets a single book by ISBN", async () => {
    const res = await request(app).get(`/books/${sampleBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.isbn).toBe(sampleBook.isbn);
  });

  test("Responds with 404 if book not found", async () => {
    const res = await request(app).get("/books/9999999999");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /books", () => {
  test("Creates a new book", async () => {
    const newBook = {
      isbn: "0987654321",
      amazon_url: "http://a.co/new",
      author: "New Author",
      language: "english",
      pages: 200,
      publisher: "New Publisher",
      title: "New Book",
      year: 2022
    };

    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.isbn).toBe(newBook.isbn);
  });

  test("Fails to create book with missing required field", async () => {
    const invalidBook = {
      isbn: "0987654322",
      amazon_url: "http://a.co/new",
      author: "New Author"
      // Missing other required fields
    };

    const res = await request(app).post("/books").send(invalidBook);
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", () => {
  beforeEach(async () => {
    await db.query("INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [sampleBook.isbn, sampleBook.amazon_url, sampleBook.author, sampleBook.language, sampleBook.pages, sampleBook.publisher, sampleBook.title, sampleBook.year]);
  });

  test("Partially updates an existing book", async () => {
    const partialUpdate = {
      title: "Updated Title",
      pages: 150
    };

    const res = await request(app).put(`/books/${sampleBook.isbn}`).send(partialUpdate);
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.title).toBe("Updated Title");
    expect(res.body.book.pages).toBe(150);
  });

  test("Responds with 404 if book to update not found", async () => {
    const res = await request(app).put("/books/9999999999").send({ title: "No Book" });
    expect(res.statusCode).toBe(404);
  });

  test("Fails to update book with invalid data", async () => {
    const res = await request(app).put(`/books/${sampleBook.isbn}`).send({ year: "invalid year" });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", () => {
  test("Deletes a book", async () => {
    const res = await request(app).delete(`/books/${sampleBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });

  test("Responds with 404 if book to delete not found", async () => {
    const res = await request(app).delete("/books/9999999999");
    expect(res.statusCode).toBe(404);
  });
});

