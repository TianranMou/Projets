
// 立即执行登录检查，不等待window.onload
(function() {
    fetch('backend/check_login_status.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = 'account.html?needLogin=true';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'account.html?needLogin=true';
        });
})();