// models/book.js

const db = require("../db");

/** Collection of related methods for books. */

class Book {
  // Existing methods...

  /** Update data with matching ISBN to data, return updated book.
   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   */
  static async update(isbn, data) {
    const fields = Object.keys(data);
    if (fields.length === 0) throw new Error("No fields provided to update");

    const setClause = fields.map((field, idx) => `${field}=$${idx + 1}`).join(", ");
    const values = Object.values(data);
    values.push(isbn);

    const result = await db.query(
      `UPDATE books SET ${setClause} WHERE isbn=$${values.length} RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`,
      values
    );

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}'`, status: 404 };
    }

    return result.rows[0];
  }

  // Existing methods...
}

module.exports = Book;

