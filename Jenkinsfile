pipeline {
    agent any

    environment {
        PORT = credentials('port')
        NODE_ENV = credentials('node-env')
        CORS_ORIGIN = credentials('cors-origin')
        TMDB_API_KEY = credentials('tmdb-api-key')
    }

    stages {

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                pm2 delete backend || true
                PORT=$PORT NODE_ENV=$NODE_ENV CORS_ORIGIN=$CORS_ORIGIN TMDB_API_KEY=$TMDB_API_KEY \
                pm2 start dist/server.js --name backend
                pm2 save
                '''
            }
        }
    }
}
