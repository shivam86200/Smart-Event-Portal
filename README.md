# Smart Event Management Portal

Static Node.js website for the capstone project. The page presents the Smart Event Management Portal story, the CI/CD architecture, the delivery phases, the technology stack, the innovation ideas, and the submission checklist in one responsive interface.

## Files

- `index.html` - main landing page
- `styles.css` - visual design and responsive layout
- `script.js` - lightweight interactions such as navigation highlighting and tab switching
- `server.js` - Node.js backend that serves the site and exposes basic API routes
- `package.json` - project metadata and start script

## Website Goals

- Present the project scenario clearly
- Show the technology stack with Node.js as the backend choice
- Summarize the Docker, Kubernetes, and Jenkins phases without running any DevOps commands
- Show the required deliverables and innovation ideas
- Provide a polished presentation page for demo day or submission

## Jenkins Setup

- Create a Pipeline job named `Smart-Event-Portal`
- Choose `Pipeline script from SCM`
- Set SCM to `Git`
- Use the repository URL `https://github.com/shivam86200/Smart-Event-Portal.git`
- Set the branch to `*/main`
- Set the script path to `Jenkinsfile`
- Add credentials with IDs `github-creds` and `dockerhub-creds`
- Enable the GitHub webhook trigger for automatic builds on push

## Pipeline Stages

Checkout, Build, Test, Docker Build, Docker Push, Deploy, and Verify.

## Jenkins Demo Points

- Webhook trigger from GitHub starts the pipeline automatically
- Docker image is built and pushed to Docker Hub without manual intervention
- Kubernetes deployment is updated and verified with rollout status
- If deployment fails, the pipeline rolls the deployment back automatically

## Final Demonstration

- Container running
- Docker Hub image
- Pods
- Services
- Replica scaling
- Rolling update
- Rollback
- Jenkins build and pipeline success
- Application running

## Notes

- The Jenkinsfile uses the Docker Hub image name `stuxnet12/smart-event-portal`.
- If you use a different Docker Hub account, update the `IMAGE_NAME` value in [Jenkinsfile](Jenkinsfile).

## Opening the Site

Run the Node.js server with `npm install` followed by `npm start`, then open `http://localhost:3000`.
