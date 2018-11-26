图书借阅系统
前后端分离
前端模块为library-web，使用npm/vue/element-ui开发
后端模块为library-server，使用maven/spring/spring-mvc/mybatis开发，构建父子模块并严格规范模块间的依赖关系，使用dubbo/zookeeper构建分布式架构，数据库使用mysql，后台自带一套页面，使用原生js/bootstrap开发

前端启动方式：npm run dev
后端启动方式： 1. 启动zookeeper 2. 启动service层BootStrap 3. 以web应用的方式在tomcat部署并启动controller层
