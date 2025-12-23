package com.wxs.test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseTest {
    public static void main(String[] args) {
        // 数据库连接信息

        String url = "jdbc:mysql://127.0.0.1:3306/online_study_system?useUnicode=true&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "123456"; // 替换为你的密码

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            // 1. 加载驱动（MySQL 8.x可省略）
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 2. 建立连接
            conn = DriverManager.getConnection(url, user, password);
            System.out.println("数据库连接成功");

            // 3. 创建Statement，执行SQL
            stmt = conn.createStatement();
            String sql = "SELECT * FROM role LIMIT 5;";
            rs = stmt.executeQuery(sql);

            // 4. 处理查询结果
            System.out.println("role表前5条数据：");
            while (rs.next()) {
                int id = rs.getInt("id");
                String roleName = rs.getString("name");
                System.out.println("ID: " + id + ", 角色名: " + roleName);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 5. 关闭资源
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
            System.out.println("数据库连接已关闭");
        }
    }
}