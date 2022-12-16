FROM fedora
MAINTAINER http://fedoraproject.org/wiki/Cloud
RUN mkdir app

# ATOMIC CLI run command

# Install nodejs and npm
RUN sudo dnf -y update && dnf -y install npm && dnf clean all
RUN sudo dnf -y update && dnf -y install httpd git  && dnf clean all
# Show nodejs and npm versions installed
RUN sudo node -v
RUN sudo npm -v
RUN sudo npm install -g yarn
RUN sudo curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
RUN source ~/.bashrc && nvm install 15 
RUN source ~/.bashrc && nvm use 15
RUN cd app
# Set port for nodejs to listen on and expose it
ENV PORT 8080
EXPOSE 8080
EXPOSE 27017
# Set production environment for nodejs application
COPY . .
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN sudo yarn cache clean --force

RUN sudo yarn setup
RUN sudo yarn bootstrap
RUN sudo yarn --openssl-legacy-provider build 
CMD ["sudo", "yarn", "start"] 
