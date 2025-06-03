pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: 'https://github.com/samuelMartinez01/PupasFE.git']]
                ])
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            echo 'El pipeline terminó (éxito o error)'
        }
        failure {
            echo 'La compilación o los tests han fallado'
        }
        success {
            echo '¡Pipeline exitoso! 🥵'
        }
    }
}

