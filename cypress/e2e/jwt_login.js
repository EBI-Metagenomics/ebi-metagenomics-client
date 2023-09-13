const loginUrl = 'http://localhost:9000/metagenomics/login';
const homePageUrl = 'http://localhost:9000/metagenomics';
const myDataPageUrl = 'http://localhost:9000/metagenomics/mydata';
const username = 'webin-66688';
const password = 'DEBSzfWkQL64S@4';
describe('JWT Login', () => {
  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('should log in successfully with valid credentials and the login should be persisted', () => {
    logUserIn();
    cy.window().its('localStorage.token').should('exist');
    cy.contains(`You are logged in as ${username}`).should('be.visible');
    cy.reload();
    cy.contains(`You are logged in as ${username}`).should('be.visible');
  });

  it('should display an error message for invalid credentials', () => {
    cy.get('#id_username').type('invalid_username');
    cy.get('#id_password').type('invalid_password');
    cy.get('#submit-id-submit').click();
    cy.get('.vf-form__helper--error').should('be.visible');
  });

  it('should redirect to login when accessing an auth-protected route, then back to the original page after login', () => {
    cy.visit(myDataPageUrl);
    cy.url().should('eq', loginUrl);
    cy.get('#id_username').type(username);
    cy.get('#id_password').type(password);
    cy.get('#submit-id-submit').click();
    cy.url().should('eq', myDataPageUrl);
  });

  it('should allow users to resume their private data submission after login', () => {
    cy.visit(homePageUrl);
    cy.contains('a', 'Submit and/or Request').click();
    cy.url().should('eq', loginUrl);
    logUserIn();
    cy.url().should('eq', homePageUrl);
    cy.get('.ReactModal__Content--after-open').should('be.visible');
  });

  const logUserIn = () => {
    cy.get('#id_username').type(username);
    cy.get('#id_password').type(password);
    cy.get('#submit-id-submit').click();
  }
});
