/* global Cypress, cy */

const my = {};

my.goHome = () => cy.get(`a#go-home`).click()
my.openDrawer = () => cy.get(`button#open-drawer`).click();
my.closeDrawer = () => cy.get(`button#close-drawer`).click();
my.toggleAdminMode = () => cy.get(`label#toggle-admin-mode `).click();

my.authenticate = () => {
  cy.visit(`${Cypress.env("baseUrl")}/admin`);
  cy.get(`input#admin-token`).clear().type("abc123");
  cy.get("button#register-admin-token").click();
  cy.contains("div", /registered for admin access/i).should("exist")
  my.goHome();
};

my.enterPostData = (data) => {
  for (const key of ["title", "category", "slug", "tldr"]) {
    if (typeof data[key] === "string") {
      if (data[key].length > 0) {
        cy.get(`input[name="${key}"]`).clear().type(data[key]);
      } else {
        cy.get(`input[name="${key}"]`).clear();
      }
    }
  }
  if (typeof data.content === "string") {
    if (data.content.length > 0) {
      cy.get(`textarea[data-testid="text-area"]`).clear().type(data.content);
    } else {
      cy.get(`textarea[data-testid="text-area"]`).clear();
    }
  }
};

my.publishPost = () => {
  cy.get(`button#fab`).click();
  cy.get(`button#fab-publish`).click(10, 10);
  cy.get(`button#copy-permalink`).should("exist");
};

my.discard = () => {
  cy.get(`button#fab`).click();
  cy.get(`button#fab-discard`).click(10, 10);
  cy.get(`button#copy-permalink`).should("exist");
};

my.saveChanges = () => {
  cy.get(`button#fab`).click();
  cy.get(`button#fab-save`).click(10, 10);
  cy.get(`button#copy-permalink`).should("exist");
};

my.createPost = (data) => {
  my.goHome();
  cy.get(`button#fab`).click();
  my.enterPostData(data);
  my.publishPost();
};

my.editPost = (data) => {
  my.goHome();
  cy.get(`a[href="/${data.slug}"]`).click();
  cy.get(`button#fab`).dblclick(); // TODO: why do we need to dblclick here?
  my.enterPostData(data);
  my.saveChanges();
};

module.exports = my
