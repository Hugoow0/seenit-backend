pipeline {
    agent { label 'build-agent' }

    stages {

        stage('Install') {
            steps {
                sh 'npm ci --include=dev'
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
                echo "Starting deployment..."

                pm2 delete backend || true

                pm2 start dist/server.js --name backend

                pm2 save
                '''
            }
        }
    }
}