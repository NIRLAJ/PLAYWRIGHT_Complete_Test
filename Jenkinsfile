pipeline {
    agent any

    tools {
        nodejs 'Node24'
    }

    environment {
        CI = "true"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
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

        stage('Regression Tests') {
            steps {
                sh 'npm run test:regression'
            }
        }

        stage('API Tests') {
            steps {
                sh 'npm run test:api'
            }
        }

        stage('AI Tests') {
            when {
                environment name: 'GEMINI_API_KEY', value: ''
                not {
                    environment name: 'GEMINI_API_KEY', value: ''
                }
            }
            steps {
                sh 'npm run test:ai'
            }
        }

    }

    post {

        always {

            archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }

        success {
            echo '✅ All tests passed.'
        }

        failure {
            echo '❌ Some tests failed.'
        }
    }
}