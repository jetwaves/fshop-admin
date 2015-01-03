fshop-admin 分销网店管理后台（商品及用户管理系统）


===========

用途：

	一个简单的网店管理后台

使用：

	前端：		jquery, bootstrap, angularjs, datatables, validform
	后端：		mongodb( 通过mongojs包 )
	前后都用：	underscorejs
	其他：		crypto 做加密算法
				moment 管时间格式


特色和希望解决的问题：

	网店后台管理页面的绝大多数操作都是模型的CRUD，每个模型单独写前后端耗费太多，

	基于DRY原则：

		以products 为例：

			products.js 中 只有 5，6两行跟模型相关，分别为模型英文和中文名
				其他代码都是CRUD的页面显示、跳转和动作
			views/products/ 有	list.html   作为商品列表显示
							  	update.html 作为商品详情页面，用于新增和修改
							两个html模板都已通过后台传值跟具体模型名称解耦合

		新增一个模型的CRUD的时候，只需要：

			1. 复制products.js   复制 views/products 目录，命名为新的model名字，如 ads
			2. ads.js 的5 6 两行修改模型英文中文名称  ads  广告
			3. list.html 	修改 datatables 的 columns参数，是列的字段名
			4. list.html 	修改 datatables 的 thead 参数，是列的字段中文名
			5. update.html  删除products的字段列表，新增ads的字段列表
								都是复制粘贴，只需要改  {{object.*******}} 中的  ******
								
		特殊需求： 

			1. 有特殊的表单验证需求和界面需求的时候自个去编辑update.html
						http://validform.rjboy.cn/document.html
			2. list.html里面使用datatables的自定义渲染和过滤，
					处理几千条数据的列表，排序，筛选，查找，自定义跳转等功能毫无压力
						http://datatables.net/manual/index

-----------

1. 安装和初始化 

1.1. 	修改routes/init.js 13# dbName，使用自定义的数据库名字
1.2. 	修改routes/init.js 17# - 19# 的超级用户用户名，密码和salt
1.3. 	(可选)自定义routes/init.js 中 encryptPassword 方法的加密算法，
				记得也要去修改  users.js 和 auth.js 
			TODO: 
				加密算法	抽出来放到一个独立模块
				_infoJump	抽出来放到一个独立模块
1.4. 	执行 localhost:3000/init/init，初始化数据库和超级用户

