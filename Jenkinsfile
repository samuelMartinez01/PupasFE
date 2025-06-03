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
                sh 'docker compose down || true'
            }
        }

        stage('Build y Test (Docker Compose)') {
            steps {
                script {
                    sh 'docker compose up --build -d'
                    // Cambia el nombre del servicio si es necesario
                    sh 'docker compose exec -T pupasfe npm test'
                }
            }
        }
    }

    post {
        always {
            sh 'docker compose down || true'
            // Publica los resultados de los tests en Jenkins
            junit 'reports/junit/test-results.xml'
        }
        failure {
            echo 'La compilación o los tests han fallado'
        }
        success {
            echo '¡Pipeline exitoso! 🥵'
        }
    }
}
