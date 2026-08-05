# Smart Event Management Portal

A polished demo web application for the CI/CD assignment on Docker, Kubernetes, Jenkins, and GitHub.

## Features

- User registration and login
- Dedicated login and register pages
- Browse upcoming events
- Book tickets
- View booking history
- Admin create, update, and delete event management flow
- Dockerized runtime
- Kubernetes manifests for rolling updates and scaling
- Jenkins pipeline for test, build, and deploy automation

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

Dedicated auth pages:

- `http://localhost:3000/login.html`
- `http://localhost:3000/register.html`

## Demo credentials

- Admin: `admin@smartevent.local` / `Admin@123`
- User: `member@smartevent.local` / `Member@123`

## Docker

```bash
docker build -t smart-event-management-portal .
docker run -p 3000:3000 smart-event-management-portal
```

## Kubernetes

Apply the manifests in the `k8s` folder after building and pushing your image.

## Jenkins pipeline

The `Jenkinsfile` runs the test step, builds the image, and applies the Kubernetes manifests.

## Author

Shivam Singh
