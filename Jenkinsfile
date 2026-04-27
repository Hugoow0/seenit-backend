pipeline {
    agent { label 'build-agent' }

    environment {
        DEPLOY_USER = 'ubuntu'
        DEPLOY_DIR = '/home/ubuntu/backend'
    }

    stages {
        stage('Production Pipeline') {
            when {
                expression {
                    env.GIT_BRANCH == 'origin/main' ||
                    env.GIT_BRANCH == 'main'
                }
            }

            stages {
                stage('Install') {
                    steps {
                        sh 'npm ci --include=dev'
                    }
                }

                stage('Test') {
                    steps {
                        echo "Running Vitest test suite..."
                        sh 'npm run test' 
                    }
                }

                stage('Build & Prepare') {
                    steps {
                        sh '''
                        npm run build

                        echo "Pruning dev dependencies..."
                        npm prune --omit=dev
                        '''
                    }
                }

                stage('Deploy') {
                    steps {
                        withCredentials([string(credentialsId: 'tmdb-api-key', variable: 'TMDB_API_KEY')]) {
                            sshagent(['backend-ssh-key']) {
                                sh '''
                                echo "Preparing deployment artifacts..."
                                tar -czf deploy.tar.gz dist/ node_modules/ package.json

                                echo "Ensuring target directory exists on Backend..."
                                mkdir -p ~/.ssh

                                ssh-keyscan -H $BACKEND_IP >> ~/.ssh/known_hosts
                                ssh $DEPLOY_USER@$BACKEND_IP "mkdir -p $DEPLOY_DIR"        

                                echo "Transferring files to Backend server..."
                                scp deploy.tar.gz $DEPLOY_USER@$BACKEND_IP:$DEPLOY_DIR/        

                                echo "Executing deployment on Backend server..."
                                ssh $DEPLOY_USER@$BACKEND_IP "
                                    cd $DEPLOY_DIR                                

                                    tar -xzf deploy.tar.gz                                

                                    # DYNAMICALLY CREATE THE .ENV FILE
                                    echo 'NODE_ENV=$NODE_ENV' > .env
                                    echo 'PORT=$PORT' >> .env
                                    echo 'CORS_ORIGIN=$CORS_ORIGIN' >> .env
                                    echo 'TMDB_API_KEY=$TMDB_API_KEY' >> .env                                

                                    pm2 delete backend || true
                                    pm2 start dist/server.js --name backend
                                    pm2 save
                                "
                                '''
                            }
                        }
                    }
                }
            }
        }
    }
}