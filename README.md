# ats-amplifier
Boost Resume ATS score

## Getting Started

This section provides a quick start guide to get the Turf Booking Backend up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure that you have the following installed on your local development machine:

- Node.js (version 20 or newer)
- npm (usually comes with Node.js)

### Installing

1. **Fork the Repository**: Click on the 'Fork' button at the top right corner of this page. This will create a copy of this repository in your GitHub account.

2. **Clone the Repository**: Clone the forked repository to your local machine. To clone a repository, click on the 'Code' button at the top right corner of the repository page, and copy the HTTPS URL. Then, run the following command in your terminal:

```bash
git clone git@github.com:10kartik/turf-reservation-api.git
```

3. **Install Dependencies**: Navigate to the cloned repository and run the following command to install all the dependencies:

```bash
npm install
```

4. **Set Environment Variables**: Rename the sample.env file to .env and update the variables with your specific configuration. The file includes the following environment variables:
```bash
GCP_BUCKET_NAME=gcp-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=gcp-credentials.json
ENVIRONMENT=development
APP_NAME=ats-amplifier
PORT=3000
webhook_url=https://hooks.slack.com/services/ABC/XYZ/a1b2c3
```

5. **Start the Server**: Run the following command to start the server:

```bash
npm start
```

That's it! The server should now be running at http://localhost:3000.