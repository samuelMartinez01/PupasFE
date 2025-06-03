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

        stage('Limpiar contenedores previos') {
            steps {
                // Si ya existe, lo apaga y elimina
                sh 'docker compose down || true'
            }
        }

        stage('Build y Test (Docker Compose)') {
            steps {
                script {
                    sh 'docker compose up --build -d'
                    // Espera si es necesario: sh 'sleep 10'
                    sh 'docker compose exec -T pupasfe npm test'
                }
            }
        }
    }

    post {
        always {
            // apaga contenedores aunque falle
            sh 'docker compose down || true'
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
