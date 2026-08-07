pipeline {
    agent any

    

    environment {
        CI = 'true'
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

        stage('Run Tests') {
            parallel {

                stage('Smoke') {
                    steps {
                        sh 'npm run test:smoke'
                    }
                }

                stage('Regression') {
                    steps {
                        sh 'npm run test:regression'
                    }
                }

                stage('API') {
                    steps {
                        sh 'npm run test:api'
                    }
                }
            }
        }

        stage('AI Tests') {
            when {
                expression {
                    return env.GEMINI_API_KEY?.trim()
                }
            }
            steps {
                sh 'npm run test:ai'
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
        }

        success {
            echo '✅ Pipeline completed successfully!'
        }

        failure {
            echo '❌ Pipeline failed.'
        }
    }
}