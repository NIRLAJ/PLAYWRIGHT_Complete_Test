pipeline {
    agent any

    environment {
        CI = 'true'

        BASE_URL = 'https://www.saucedemo.com'

        APP_USERNAME = 'standard_user'
        APP_PASSWORD = 'secret_sauce'

        HEADLESS = 'true'
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Info') {
            steps {
                sh '''
                    echo "===== Environment ====="
                    node -v
                    npm -v
                    git --version
                    java -version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install chromium'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Smoke Tests') {
            steps {
                sh 'npm run test:smoke'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true,
                  testResults: 'test-results/*.xml'

            archiveArtifacts artifacts: 'playwright-report/**',
                             fingerprint: true,
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'test-results/**',
                             allowEmptyArchive: true
        }

        success {
            echo 'Playwright Pipeline completed successfully!'
        }

        failure {
            echo 'Playwright Pipeline failed.'
        }
    }
}