const loginUrl = 'http://localhost:9000/metagenomics/login';
const username = 'webin-66688';
const password = 'DEBSzfWkQL64S@4';
describe('JWT Login', () => {
  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('should log in successfully with valid credentials and the login should be persisted', () => {
    cy.get('#id_username').type(username);
    cy.get('#id_password').type(password);
    cy.get('#submit-id-submit').click();
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
    cy.visit('http://localhost:9000/metagenomics/mydata');

    // Ensure that the user is redirected to the login page
    cy.url().should('eq', loginUrl); // Replace with the expected login page URL

    cy.get('#id_username').type(username); // Replace with a valid username
    cy.get('#id_password').type(password); // Replace with a valid password
    cy.get('#submit-id-submit').click();

    cy.url().should('eq', 'http://localhost:9000/metagenomics/mydata'); // Replace with the expected URL of the protected route
  });

  // it('should allow users to resume their private data submission after login', () => {
  //   cy.visit('http://localhost:9000/metagenomics');
  //
  // }




  // it('should redirect to the desired destination after login', () => {
  //   // Simulate a desired destination in the query parameter
  //   cy.visit('/login?from=private-request'); // Replace with the desired destination
  //
  //   cy.get('#id_username').type('your_username'); // Replace with a valid username
  //   cy.get('#id_password').type('your_password'); // Replace with a valid password
  //   cy.get('button[type="submit"]').click();
  //
  //   // Check if the user is redirected to the desired destination
  //   cy.url().should('eq', '/private-request'); // Replace with the expected destination URL
  // });
  //
  // it('should focus on the username input field on page load', () => {
  //   cy.focused().should('have.attr', 'id', 'id_username');
  // });

  // Add more test cases as needed...
});
