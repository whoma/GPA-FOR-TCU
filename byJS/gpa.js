/**
 *  author: 张探长
 *  time: 2018-4-10
 */
const ajax = request => {
    let r = new XMLHttpRequest();
    r.open(request.method, request.url, true);
    r.onreadystatechange = () => {
        if (r.readyState === 4) {
            request.callback(r.response);
        }
    }
    r.send();
}

let html = `
<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset='utf-8'" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPA查询结果</title>
    <!-- <link rel="stylesheet" type="text/css" href="newStyle.css" /> -->
    <style>
        body {
    width: 80%;
    margin: 40px auto;
    font-family: 'trebuchet MS', 'Lucida sans', Arial;
    font-size: 14px;
    color: #444;
}

table {
    width: 100%;
    *border-collapse: collapse; /* IE7 and lower */
    border-spacing: 0;
}

.bordered {
    border: solid #ccc 1px;
    -moz-border-radius: 6px;
    -webkit-border-radius: 6px;
    border-radius: 6px;
    -webkit-box-shadow: 0 1px 1px #ccc;
    -moz-box-shadow: 0 1px 1px #ccc;
    box-shadow: 0 1px 1px #ccc;
}

.bordered tr:hover {
    background: #fbf8e9;
    -o-transition: all 0.1s ease-in-out;
    -webkit-transition: all 0.1s ease-in-out;
    -moz-transition: all 0.1s ease-in-out;
    -ms-transition: all 0.1s ease-in-out;
    transition: all 0.1s ease-in-out;
}

.bordered td, .bordered th {
    border-left: 1px solid #ccc;
    border-top: 1px solid #ccc;
    padding: 10px;
    text-align: center;
}

.bordered th {
    background-color: #dce9f9;
    background-image: -webkit-gradient(linear, left top, left bottom, from(#ebf3fc), to(#dce9f9));
    background-image: -webkit-linear-gradient(top, #ebf3fc, #dce9f9);
    background-image: -moz-linear-gradient(top, #ebf3fc, #dce9f9);
    background-image: -ms-linear-gradient(top, #ebf3fc, #dce9f9);
    background-image: -o-linear-gradient(top, #ebf3fc, #dce9f9);
    background-image: linear-gradient(top, #ebf3fc, #dce9f9);
    -webkit-box-shadow: 0 1px 0 rgba(255, 255, 255, .8) inset;
    -moz-box-shadow: 0 1px 0 rgba(255, 255, 255, .8) inset;
    box-shadow: 0 1px 0 rgba(255, 255, 255, .8) inset;
    border-top: none;
    text-shadow: 0 1px 0 rgba(255, 255, 255, .5);
}

.bordered td:first-child, .bordered th:first-child {
    border-left: none;
}

.bordered th:first-child {
    -moz-border-radius: 6px 0 0 0;
    -webkit-border-radius: 6px 0 0 0;
    border-radius: 6px 0 0 0;
}

.bordered th:last-child {
    -moz-border-radius: 0 6px 0 0;
    -webkit-border-radius: 0 6px 0 0;
    border-radius: 0 6px 0 0;
}

.bordered th:only-child {
    -moz-border-radius: 6px 6px 0 0;
    -webkit-border-radius: 6px 6px 0 0;
    border-radius: 6px 6px 0 0;
}

.bordered tr:last-child td:first-child {
    -moz-border-radius: 0 0 0 6px;
    -webkit-border-radius: 0 0 0 6px;
    border-radius: 0 0 0 6px;
}

.bordered tr:last-child td:last-child {
    -moz-border-radius: 0 0 6px 0;
    -webkit-border-radius: 0 0 6px 0;
    border-radius: 0 0 6px 0;
}


    </style>
    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
</head>

<body>
    <div id="app">
        <h2>
            包含不及格成绩的GPA:&nbsp;&nbsp;
            <span id="GPAAll">{{GPA}}</span>
            <br> 除去不及格成绩的GPA:&nbsp;&nbsp;
            <span id="OPGPAAll">{{NPGPA}}</span>
        </h2>

        <div align="right">
            <input type="button" value="重置" onclick="window.location.reload()" /> &nbsp;&nbsp;
        </div>
        <table id="tabProduct" class="bordered">
            <tr>
                <th>课程号</th>
                <th>课序号</th>
                <th>课程名</th>
                <th>英文课程名</th>
                <th Name="credit">学分</th>
                <th>课程属性</th>
                <th EditType="TextBox" Name="score">成绩</th>
                <th>未通过原因</th>
                <th Expression="score" Name="weight">绩点</th>
            </tr>

            <tr v-for="n in node">
                <td>{{n.numberShort}}</td>
                <td>{{n.numberLong}}</td>
                <td>{{n.chName}}</td>
                <td>{{n.enName}}</td>
                <td>{{n.credit}}</td>
                <td>{{n.property}}</td>
                <td>
                    <input type="text" v-model="n.score">
                </td>
                <td>{{n.npReason}}</td>
                <td>{{n.weight}}</td>
            </tr>

        </table>

    </div>
    <br>
    <br>

    <h5 align="right">stay hungry stay foolish!</h5>
    <br>
</body>

</html>
`

// 计算绩点
function GetTableData(node) {
    /* 
      学分 * 绩点 是一样的
      唯一不一样的地方就是 学分 相加的
      只算及格的话就是 只要 及格的
       */
    let TotalCredit = 0;
    let npTotalCredit = 0;
    let totalWeightMultiCredit = 0;
    for (let course of node) {
        course.weight = getWeight(course.score)
        let c = Number(course.credit);
        totalWeightMultiCredit += course.weight * c;
        TotalCredit += c;
        if (course.weight != 0) {
            npTotalCredit += c;
        }
    }

    let o = {
        GPA: totalWeightMultiCredit / TotalCredit,
        NPGPA: totalWeightMultiCredit / npTotalCredit,
    }

    return o;
}
// 获取绩点 
function getWeight(score) {
    let weight = "";
    let reg = new RegExp("^[0-9.]*$");
    if (reg.test(score)) {
        score = Number(score);
        if (score >= 95) {
            weight = 4.5;
        } else if (score >= 90 && score <= 94) {
            weight = 4.0;
        } else if (score >= 85 && score <= 89) {
            weight = 3.5;
        } else if (score >= 80 && score <= 84) {
            weight = 3.0;
        } else if (score >= 75 && score <= 79) {
            weight = 2.5;
        } else if (score >= 70 && score <= 74) {
            weight = 2.0;
        } else if (score >= 65 && score <= 69) {
            weight = 1.5;
        } else if (score >= 60 && score <= 64) {
            weight = 1.0;
        } else {
            weight = 0.0;
        }
    } else if ("优良中合格及格".indexOf(score) != -1) {
        if (score.indexOf("优") != -1) {
            weight = 4.0;
        }
        if (score.indexOf("良") != -1) {
            weight = 3.0;
        }
        if (score.indexOf("中") != -1) {
            weight = 2.0;
        }
        if ((score.indexOf("合格") != -1) || (score.indexOf("及格") != -1)) {
            weight = 1.0;
        }
    }
    return weight;
}

let node = [];
const request = {
    url: 'gradeLnAllAction.do?type=ln&oper=sxinfo&lnsxdm=001',
    method: 'GET',
    callback(r) {
        let el = document.createElement('div');
        el.innerHTML = r;
        let nodeTr = el.querySelector('.titleTop2').querySelectorAll('tr');
        // 课程号 课序号 课程名 英文课程名 学分 课程属性 成绩 未通过原因
        let type = ['numberShort', 'numberLong', 'chName', 'enName', 'credit', 'property', 'score', 'npReason',];
        for (let i = 2; i < 59; i++) {
            let nodeTd = nodeTr[i].querySelectorAll('td')
            let o = {};
            for (let j = 0; j < 8; j++) {
                let t = type[j];
                o[t] = nodeTd[j].innerText.replace(/\n|\ |\t|\r|\s+/g, '');
            }

            //o['weight'] = getWeight(o['score'])
            node.push(o);
        }
        // open new tab show results
        // 变量 html 也就是 success.html 中的内容
        document.querySelector('html').innerHTML = html;
        let s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/vue';
        document.body.appendChild(s);
        s.onload = s.onreadystatechange = function () {
            new Vue({
                el: '#app',
                data: {
                    node: node,
                },
                computed: {
                    GPA: function () {
                        let o = GetTableData(this.node);
                        return o.GPA;
                    },
                    NPGPA: function () {
                        let o = GetTableData(this.node);
                        return o.OPGPA;
                    },
                },
            })
        };

    }
}

ajax(request)