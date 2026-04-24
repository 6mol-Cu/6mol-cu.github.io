

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

    // 额外论文规范上传区域的显示/隐藏
    const extra规范Toggle = document.getElementById('extra规范-toggle');
    const extra规范UploadArea = document.getElementById('extra规范-upload-area');
    
    if (extra规范Toggle && extra规范UploadArea) {
        extra规范Toggle.addEventListener('change', function() {
            if (this.checked) {
                extra规范UploadArea.style.display = 'block';
            } else {
                extra规范UploadArea.style.display = 'none';
            }
        });
    }
    
    // 提交按钮点击事件
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            // 这里需要添加API调用代码
            // 1. 获取表单数据
            const paperFile = document.getElementById('paper-upload').files[0];
            const university = document.getElementById('university-select').value;
            const hasExtra规范 = document.getElementById('extra规范-toggle').checked;
            const extra规范File = hasExtra规范 ? document.getElementById('extra规范-upload').files[0] : null;
            
            // 2. 验证表单
            if (!paperFile) {
                alert('请上传论文文档');
                return;
            }
            if (!university) {
                alert('请选择学校');
                return;
            }
            
            // 3. 调用API
            // 注意：这里需要填写你的API密钥和工作流ID
            const API_KEY = 'YOUR_API_KEY_HERE'; // 替换为你的API密钥
            const WORKFLOW_ID = 'YOUR_WORKFLOW_ID_HERE'; // 替换为你的工作流ID
            const API_URL = `https://api.dify.ai/v1/workflows/${WORKFLOW_ID}/run`;
            
            // 构建请求数据
            const formData = new FormData();
            formData.append('paper', paperFile);
            formData.append('university', university);
            formData.append('has_extra规范', hasExtra规范);
            if (hasExtra规范 && extra规范File) {
                formData.append('extra规范', extra规范File);
            }
            
            // 发送请求
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // 处理响应
                console.log('API响应:', data);
                
                // 更新结果区域
                const resultTitle = document.getElementById('result-title');
                const resultContent = document.getElementById('result-content');
                const generatedTitle = document.getElementById('generated-title');
                
                if (data.success) {
                    resultTitle.style.display = 'none';
                    resultContent.style.display = 'block';
                    generatedTitle.textContent = data.data.generated_title || '生成的论文标题';
                    
                    // 更新文献溯源模块
                    const citationResult = document.getElementById('citation-result');
                    citationResult.innerHTML = data.data.citation_analysis || '<p>文献分析结果将显示在这里</p>';
                    
                    // 更新逻辑审计模块
                    const logicResult = document.getElementById('logic-result');
                    logicResult.innerHTML = data.data.logic_analysis || '<p>逻辑分析结果将显示在这里</p>';
                } else {
                    alert('请求失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('错误:', error);
                alert('请求失败，请检查网络连接');
            });
        });
    }
    
    // 预览链接点击事件
    const previewLink = document.getElementById('preview-link');
    if (previewLink) {
        previewLink.addEventListener('click', function(e) {
            e.preventDefault();
            // 这里需要添加预览功能
            // 例如，打开一个新窗口显示生成的论文内容
            window.open('preview.html', '_blank', 'width=800,height=600');
        });
    }
}); 
