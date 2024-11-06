const MD5Utils = {
    // 加密密码
    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return md5(password);
        } catch (e) {
            console.error('MD5 encryption failed:', e);
            return password;
        }
    }
}; 