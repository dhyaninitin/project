<!DOCTYPE html>
<html>
<head>
    <title>Reset Password Notification</title>
</head>
<body> 
    <h2 style="color:#333;">Hello!</h2>  
    <p style="color:#333;font-size:14px;">You are receiving this email because we received a password reset request for your account.</p> 
    <a href="{{ $link }}" style="padding:5px 15px; border-radius: 4px; color: #fff;display: inline-block; overflow: hidden;text-decoration: none;  background-color: #2d3748; " > Reset Password </a> 
    <p style="color:#333;font-size:14px;">This password reset link will expire in 60 minutes.</p> 
    <p style="color:#333;font-size:14px;">If you did not request a password reset, no further action is required.</p> 
    <p style="color:#333;font-size:14px;">Regards,</p> 
    <p style="color:#333;font-size:14px;">Laravel</p>
</body>
</html>