const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express();

app.set('view engine', 'ejs')

app.use('/user/register', express.static('assets'))

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const connection = mysql.createPool({
    connectionLimit: 50,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'intellectual_app'
})

//----------- LOG IN ---------------/
app.get('/user/login', (req, res) => {
    res.render('user/login')
})

app.post('/user/login', urlencodedParser, (req, res) => {
    const phone = req.body.phone
    const password = req.body.password
    connection.getConnection((err, tempConn) => {
        if (err) {
            tempConn.destroy()
        } else {
            var query = "SELECT * FROM users WHERE phone = " + phone + " AND password = " + password + ""
            tempConn.query(query, (err, logedUser, fields) => {
                // tempConn.destroy()
                if (err) {
                    res.send(err)
                } else {
                    var query2 = "SELECT * FROM `user_has_answer` WHERE user_id = " + logedUser[0].id
                        + " AND question_id = (SELECT id FROM questions ORDER BY id DESC LIMIT 1)"
                    tempConn.query(query2, (err, answeredUser, fields) => {
                        if (err) {
                            tempConn.destroy()
                            res.send(err)
                        } else {
                            tempConn.destroy()
                            if (answeredUser.length > 0) {
                                res.redirect('/user/done')
                            }
                            else {
                                res.redirect('/user/question/' + logedUser[0].id)
                            }
                        }

                    })

                }

            })
        }
    })
})



//----------- DONE ---------------/

app.get('/user/done', (req, res) => {
    res.render('user/done')
})

//----------- REGISTER ---------------/
app.get('/user/register', (req, res) => {
    res.render('user/register')
})

app.post('/user/register', urlencodedParser, (req, res) => {
    const phone = req.body.phone
    const password = req.body.password
    const wilaya = req.body.wilaya
    const first_name = req.body.first_name
    // if (phone.length < 0 && password.length < 0 && wilaya.length < 0 && first_name.length < 0) {
    //     res.redirect('/user/register')
    // }
    connection.getConnection((err, tempConn) => {
        if (err) {
            tempConn.destroy()
        } else {

            var data = { phone, password, wilaya, first_name }
            tempConn.query("INSERT INTO `users` SET ?", data, (err, results, fields) => {
                tempConn.destroy()
                if (err) {
                    res.send("حدثت مشكلة تاكد من صحة البيانات")
                } else {
                    res.redirect('/user/register/done')
                }

            })
        }
    })
})
app.get('/user/register/done', (req, res) => {
    res.render('user/register_done')
})
//----------- USER SEND ANSWER ---------------/
app.get('/user/question/:user_id', (req, res) => {

    connection.query("SELECT * FROM questions order by id desc limit 1", (error, results, fields) => {
        if (error) throw error;
        res.render('user/question', { question: results, user_id: req.params.user_id })
    })
})

//user_id	question_id	his_answer	correct_answer	his_mark
app.post('/user/answer', urlencodedParser, (req, res) => {
    var data = { phone, user_id, question_id, his_answer, correct_answer, his_mark } = req.body

    if (data.his_answer === data.correct_answer)
        data.his_mark = 1
    else
        data.his_mark = 0

    connection.getConnection((err, tempConn) => {
        if (err) {
            tempConn.destroy()
        } else {
            tempConn.query("INSERT INTO `user_has_answer` SET ?", data, (err, results, fields) => {
                tempConn.destroy()
                if (err) {
                    res.send(err)
                } else {
                    res.redirect('/user/done')
                }
            })
        }
    })
})

//ADMISSION [route]
app.get('/admin/question/create', (req, res) => {
    res.render('admin/question/create')
})

app.get('/admin/question/index', (req, res) => {
    connection.getConnection((err, tempConn) => {
        if (err) {
            tempConn.destroy()
        } else {
            tempConn.query("SELECT * FROM questions", (err, results, fields) => {
                tempConn.destroy()
                if (err) {
                    res.send(err)
                } else {
                    res.render('admin/question/index', { questions: results })
                }
            })
        }
    })

})

app.post('/admin/question/store', urlencodedParser, (req, res) => {

    connection.getConnection((err, tempConn) => {
        if (err) {
            tempConn.destroy()
        } else {
            var data = { content, a, b, c, d, ans } = req.body
            var query = "INSERT INTO questions SET ?"
            tempConn.query(query, data, (err, results, fields) => {
                tempConn.destroy()
                if (err) {
                    res.send(err)
                } else {
                    res.send("INSERTED ID is: " + results.insertId)
                }
            })
        }
    })
})




app.listen(4000, () => {
    console.log('open on: http://127.0.0.1:4000')
})