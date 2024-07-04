# NSICC CMS api

Api service for NSICC. 

## Clone Link

    https://github.com/virtuevise/NSICC.git

## Setup For Ubuntu

1. ### Php installation:

        sudo apt-get install php
        sudo apt install openssl php-common php-curl php-json php-mbstring php-mysql php-xml php-zip

2. ### Composer Installation:
    1. Install composer by following commands:

            php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"

            php -r "if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

            php composer-setup.php

            php -r "unlink('composer-setup.php');"

            sudo mv composer.phar /usr/local/bin/composer

    2. Edit .bashrc file from root directory of your Ubuntu:

            sudo nano .bashrc

    3. Add following code to the file:

            export PATH="$PATH:$HOME/.config/composer/vendor/bin"
    
    Save and Exit

    4. Now to downgrade composer to 1.*:

            sudo composer self-update --1

3. ### Install Laravel
    Install Laravel by command:
        
        composer global require laravel/installer

4. ### Intsall Xampp:
    
    1. Use this [link](https://www.apachefriends.org/download.html) to downlaod XAMPP 
    2. Clone project cms-api in htdocs folder of XAMPP using provided clone link
    3. Run Xammp:
        
            sudo /opt/lampp/manager-linux.run

            OR

            sudo /opt/lampp/manager-linux-x64.run

5. ### Edit MySQL Config File:
    1. Start XAMPP control panel
    2. From Control panel Open Conf file of MYSQL Database
    3. change the 'max_allowed_packet' to following value:    
            
            max_allowed_packet=1000M
    
    4. Re-start MySQL
    5. Re-start apache

5. ### Install Composer Packages
    Switch to directory of cms-api cloned project and run command:
        
        composer install
        
6. ### Add .ENV File

    Add .env file to project root directory and run command:
        
        composer install --ignore-platform-reqs  


7. ### Start NSICC-CMS-API Project:
        sudo php artisan serve 