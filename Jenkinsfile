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

        stage('Build y Test (Docker Compose)') {
            steps {
                script {
                    // Build los servicios y ejecuta los tests, luego apaga y elimina contenedores
                    sh 'docker compose up --build -d' // Levanta en segundo plano
                    // Espera un poco si tu contenedor necesita tiempo para "arrancar"
                    // sh 'sleep 10'

                    // Ejecutar tests dentro del contenedor principal (ajusta el nombre si es necesario)
                    sh 'docker compose exec -T <nombre_servicio> npm test'

                    // Apaga y elimina los contenedores, limpia imágenes y volúmenes temporales
                    sh 'docker compose down'
                }
            }
        }
    }

    post {
        always {
            // Siempre intenta apagar los contenedores aunque el pipeline falle
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
