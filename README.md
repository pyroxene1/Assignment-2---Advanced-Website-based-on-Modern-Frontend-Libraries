GG STORE V2



GG STORE V2 is an upgraded e-commerce website project built on top of Assignment 1. Users can register and log in to their accounts, browse and search for products in real time, add items to their personal shopping cart, and manage their profile. Administrators can manage products and view all users' shopping carts through the admin panel. This website combines user authentication, full CRUD operations, and database storage to create a more complete and secure online shopping experience. 



Solved Problem

This website addresses the issue of how to build a secure and user-specific online shopping platform. Unlike Assignment 1 where the shopping cart was shared by everyone, this version introduces a user authentication system so that each user has their own independent shopping cart. Users can search for products in real time without needing to reload the page. Administrators can manage products and monitor what items users have added to their carts, providing better oversight of the platform.



Frontend: HTML5, JavaScript

Styling: CSS3, Dark theme UI design, Using Flexbox and CSS Grid for layout design

Routing: Single-page interface with JavaScript view switching. The shop, shopping cart, admin panel, profile, and authentication sections are dynamically displayed without the need to reload the page.

Authentication: JWT (JSON Web Token) for session management, bcryptjs for password hashing

Data: Node.js, Express.js, MongoDB

Deployment: The local development is deployed on `localhost`. Use the Express server to provide front-end files and back-end API routes.



Feature List:

\- User registration and login system

\- Password hashing using bcryptjs

\- JWT-based authentication and session persistence

\- Automatic login restoration on page refresh

\- Product list, including pictures, titles, descriptions, categories and prices

\- Dynamic category filtering

\- Real-time live search bar that filters products as the user types

\- Personal shopping cart (each user has their own independent cart)

\- Add products to the shopping cart

\- Update the quantity of products in the shopping cart

\- Delete a single shopping cart item

\- Clear the entire shopping cart

\- User profile page to view and update username

\- Admin panel with three sections:

&#x20; - Product management: add, edit and delete products

&#x20; - User Carts: view all users' shopping carts and their totals

&#x20; - Users: view all registered users and delete accounts

\- Dynamic navigation bar that changes based on login status and user role



How to run the project: (Install Node.js and MongoDB)

npm install

npm run seed

npm start

