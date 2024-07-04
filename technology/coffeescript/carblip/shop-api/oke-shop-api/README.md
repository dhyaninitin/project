# Kubernetes Manifests:

This readme explains all files that are used for the deployment of the Kubernetes cluster.

Here we have different files with their versions for staging and production environments wherever applicable.

1. Deployment-prod.yml or Deployment-staging.yml
2. ExternalSecret-prod.yml or ExternalSecret-staging.yml
3. HorizontalPodAutoscaler-prod.yml or HorizontalPodAutoscaler-staging.yml
4. Ingress-prod.yml or Ingress-staging.yml
5. SecretStore-prod.yml or SecretStore-staging.yml
6. Service.yml

**Deployment:**
Deployment is used to launch the pods and maintain their replicas. Also, all the configuration related to the pod is mentioned in this file.

**ExternalSecret:**
ExternalSecret is used to fetch the values from OCI Vault and create secret in the Kubernetes cluster. Secret is used to store Confidential data or environment variables like URLs and passwords and attach them to the pods.

**HorizontalPodAutoscaler:**
HPA is used to dynamically scale in and out the replicas of the pods based on the CPU utilization of the pods.

**Ingress:**
Ingress is used to route traffic from the internet to the pod. We are using the Nginx ingress controller here.

**SecretStore:**
SecretStore is used to make the connection between the OCI vault service and Kubernetes secret. 

**Service:**
Service is used to allow traffic to pods on the cluster level and the external level as well. We are using service here to allow traffic on the cluster level so that ingress can send the request to pods through this service.
