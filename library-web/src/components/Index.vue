<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>{{userName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{department}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{team}}</el-breadcrumb-item>
      <el-breadcrumb-item>
        <el-button plain @click="logout">退出登录</el-button>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!--<el-menu-->
    <!--mode="horizontal"-->
    <!--@select="handleSelect"-->
    <!--background-color="#545c64"-->
    <!--text-color="#fff"-->
    <!--active-text-color="#ffd04b">-->
    <!--<el-menu-item index="1">书籍检索</el-menu-item>-->
    <!--<el-menu-item index="2">借阅历史</el-menu-item>-->
    <!--<el-menu-item index="3">排行榜</el-menu-item>-->
    <!--<el-menu-item index="4">书籍管理</el-menu-item>-->
    <!--<el-menu-item index="5">用户管理</el-menu-item>-->
    <!--</el-menu>-->
    <!--<div class="line"></div>-->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="书籍检索" name="first">
        <div class="searchBookConditionFrame">
          <el-input placeholder="" v-model="bookName">
            <template slot="prepend">书名</template>
          </el-input>
          <el-input placeholder="" v-model="author">
            <template slot="prepend">作者</template>
          </el-input>
          <div class="selectDiv">
            <label>
              类别：
              <el-select v-model="type" clearable placeholder="类别">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </label>
          </div>
          <div class="selectDiv">
            <label>
              所属团队：
              <el-select v-model="owner" clearable placeholder="所属团队">
                <el-option
                  v-for="item in teamOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </label>
          </div>
          <div class="radioDiv">
            <el-radio v-model="rest" label="0" @change="searchBook">显示全部书籍</el-radio>
            <el-radio v-model="rest" label="1" @change="searchBook">只显示可借</el-radio>
          </div>
          <el-button type="primary" icon="el-icon-search" style="width:100%;" @click="searchBook">搜索</el-button>
        </div>
        <div class="bookInfoFrame">
          <el-table
            :data="bookInfo"
            style="width: 95%"
            border
            fit
            :row-class-name="bookInfoRowClassName">
            <el-table-column
              prop="bookId"
              label="编号">
            </el-table-column>
            <el-table-column
              prop="bookName"
              label="书名"
            >
            </el-table-column>
            <el-table-column
              prop="author"
              label="作者"
            >
            </el-table-column>
            <el-table-column
              prop="type"
              label="类别"
            >
            </el-table-column>
            <el-table-column
              prop="publisher"
              label="出版社">
            </el-table-column>
            <el-table-column
              prop="bookshelf"
              label="书架号"
            >
            </el-table-column>
            <el-table-column
              prop="total"
              label="库存总量">
            </el-table-column>
            <el-table-column
              prop="rest"
              label="当前可借">
            </el-table-column>
            <el-table-column
              prop="score"
              label="评分">
              v-model="bookScore"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}">
            </el-table-column>

            <el-table-column label="操作" width="300%">
              <template slot-scope="scope">
                <el-button v-if="canBeBorrowed(scope.row)"
                           size="mini"
                           @click="borrowBook($event,scope.$index, scope.row)">借书
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pageFooter">
            <el-pagination
              background
              @size-change="handleBookSizeChange"
              @current-change="searchBookByPage"
              :current-page="this.bookPageIndex"
              :page-size="this.bookLimit"
              layout="total, sizes, prev, pager, next, jumper"
              :total="this.bookTotal">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>


      <el-tab-pane label="借阅历史" name="second" @click="getBorrowHistory()">
        <div class="borrowInfoFrame">
          <el-table
            :data="borrowInfo"
            style="width: 95%"
            border
            fit
            :row-class-name="borrowInfoRowClassName">
            <el-table-column
              prop="bookId"
              label="书籍编号"
              width="50%">
            </el-table-column>
            <el-table-column
              prop="bookName"
              label="书名">
            </el-table-column>
            <el-table-column
              prop="bookAuthor"
              label="作者">
            </el-table-column>
            <el-table-column
              prop="borrowTime"
              label="借书时间">
            </el-table-column>
            <el-table-column
              prop="shouldReturnTime"
              label="应还时间">
            </el-table-column>
            <el-table-column
              prop="actualReturnTime"
              label="实际还书时间">
            </el-table-column>
            <el-table-column
              prop="renewed"
              label="标签"
              width="200%">
              <template slot-scope="scope">
                <el-tag v-if="canBeRenewed(scope.row)"
                        :type="scope.row.renewed === 0 ? 'success' : 'primary'"
                        disable-transitions>可续借
                </el-tag>
                <el-tag v-if="scope.row.renewed === 1 && scope.row.returned === 0"
                        :type="scope.row.renewed === 0 ? 'success' : 'primary'"
                        disable-transitions>已续借
                </el-tag>
                <el-tag v-if="overTimeLimit(scope.row)"
                        disable-transitions>已逾期
                </el-tag>
                <el-tag v-if="scope.row.returned === 1"
                        disable-transitions>已还书
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300%">
              <template slot-scope="scope">
                <el-button v-if="isReturned(scope.row)"
                           size="mini"
                           @click="returnBook($event,scope.$index, scope.row)">还书
                </el-button>
                <el-button
                  size="mini" v-if="canBeRenewed(scope.row)"
                  @click="renewBook($event, scope.$index, scope.row)"
                >续借
                </el-button>
                <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)">推荐
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pageFooter">
            <el-pagination
              background
              @size-change="handleHistorySizeChange"
              @current-change="searchHistoryByPage"
              :page-size="this.historyLimit"
              layout="total, sizes, prev, pager, next, jumper"
              :total="this.historyTotal">
            </el-pagination>
          </div>
        </div>

      </el-tab-pane>


      <el-tab-pane label="排行榜" name="third">
        <div>
          <el-select v-model="timeLimit" placeholder="请选择时间段">
            <el-option
              v-for="item in timeLimitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="bookRankDiv">
          <el-table
            :data="bookRankInfo"
            style="width: 90%"
            :row-class-name="topNHandle">
            <el-table-column
              prop="bookId"
              label="书籍编号">
            </el-table-column>
            <el-table-column
              prop="bookName"
              label="书名">
            </el-table-column>
            <el-table-column
              prop="author"
              label="作者">
            </el-table-column>
            <el-table-column
              prop="publisher"
              label="出版社">
            </el-table-column>
            <el-table-column
              prop="borrowedCount"
              label="被借次数">
            </el-table-column>
          </el-table>
        </div>
        <div class="userRankDiv">
          <el-table
            :data="userRankInfo"
            style="width: 90%"
            :row-class-name="topNHandle">
            <el-table-column
              prop="userName"
              label="姓名">
            </el-table-column>
            <el-table-column
              prop="department"
              label="部门">
            </el-table-column>
            <el-table-column
              prop="team"
              label="团队">
            </el-table-column>
            <el-table-column
              prop="borrowCount"
              label="借书次数">
            </el-table-column>
          </el-table>
        </div>
        <div>

        </div>
      </el-tab-pane>


      <el-tab-pane label="书籍管理" name="fourth" v-if="role == 1">

      </el-tab-pane>


      <el-tab-pane label="用户管理" name="fifth" v-if="role == 1">

      </el-tab-pane>
    </el-tabs>

  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs'

  export default {
    name: "NavMenu",
    data() {
      return {
        userName: sessionStorage.getItem("userName"),
        department: sessionStorage.getItem("department"),
        team: sessionStorage.getItem("team"),
        activeName: 'first',
        role: sessionStorage.getItem("role"),
        bookName: '',
        author: '',
        publisher: '',
        owner: '',
        type: '',
        typeOptions: [],
        teamOptions: [],
        bookInfo: [],
        bookTotal: 0,
        borrowInfo: [],
        borrowInfoTotal: 0,
        bookRankInfo: [],
        userRankInfo: [],
        radio: '1',
        timeLimit: 'oneMonth',
        bookPageIndex: 1,
        bookLimit: 10,
        historyPageIndex: 1,
        historyLimit: 10,
        historyTotal: 0,
        rest: 0,
        bookScore: 5,
        timeLimitOptions: [{
          value: 'oneMonth',
          label: '最近一个月'
        }, {
          value: 'threeMonths',
          label: '最近三个月'
        }, {
          value: 'oneYear',
          label: '最近一年'
        }, {
          value: 'all',
          label: '全部'
        }],
      };
    },
    methods: {

      filterTag(value, row) {
        return row.renewed === value;
      },
      overTimeLimit(row) {
        var should = new Date(row.shouldReturnTime);
        var now = new Date();
        return (now.getTime() - should > 0);
      },
      searchBookByPage(bookPageIndex) {
        this.bookPageIndex = bookPageIndex;
        this.searchBook();
      },
      searchHistoryByPage(historyPageIndex) {
        this.historyPageIndex = historyPageIndex;
        this.getBorrowHistory();
      },
      handleBookSizeChange(size) {
        this.bookLimit = size;
        this.searchBook();
      },
      handleHistorySizeChange(size) {
        this.historyLimit = size;
        this.getBorrowHistory();
      },
      renewBook(e, index, row) {
        var button = e.currentTarget;
        button.disabled = true;
        setTimeout(() => {
          button.disabled = false;
        }, 3000);
        axios({
          url: "/cross/library/book/renewBook",
          method: "post",
          data: qs.stringify({borrowId: row.borrowId}),
        }).then(function (response) {
          if (response.data === 0) {
            this.$message({
              showClose: true,
              message: "续借成功",
              type: 'success',
            });
            this.getBorrowHistory();
          }
          if (response.data === -2) {
            this.$message({
              showClose: true,
              message: "只能续借一次哦",
              type: 'warning',
            })
          }
        }.bind(this)).catch(function (error) {
          alert("续借异常");
        })
      },
      recommendBook(index, row) {

      },
      logout() {
//          localStorage.setItem("userName","");
//          localStorage.setItem("userId","");
//          localStorage.setItem("department","");
//          localStorage.setItem("team","");
        axios({
          url: "/cross/library/logout",
          method: "post",
        }).then(function (response) {
          this.$router.replace('/library');
        }.bind(this)).catch(function (error) {
          console.log(error);
        })
      },
      bookInfoRowClassName({row}) {
        if (row.rest === 0) {
          return 'warning-row';
        } else if (row.rest > 0) {
          return 'success-row';
        }
        return '';
      },
      borrowInfoRowClassName({row}) {
        if (row.returned === 1) {
          return 'success-row';
        } else {
          return 'warning-row';
        }
      },
      topNHandle({row, rowIndex}) {
        var n = 3;
        if (rowIndex < n) {
          return 'success-row';
        }
      },
      searchBook() {
        axios({
          url: "/cross/library/book/searchBook",
          method: "post",
          data: {
            bookName: this.bookName,
            publisher: this.publisher,
            author: this.author,
            type: this.type,
            owner: this.owner,
            rest: this.rest,
            pageIndex: this.bookPageIndex,
            limit: this.bookLimit,
          },
        }).then(function (response) {
          var data = response.data;
          this.bookInfo = data.books;
          this.bookTotal = data.results;
        }.bind(this)).catch(function (error) {
          alert("获取书籍信息异常");
          router.replace("/library");
        })
      },
      getBorrowHistory() {
        axios({
          url: "/cross/library/borrowInfo/getHistory",
          method: "post",
          data: {pageIndex: this.historyPageIndex, limit: this.historyLimit},
        }).then(function (response) {
          var data = response.data;
          this.borrowInfo = data;
          if (data.length > 0) {
            this.historyTotal = data[0].results;
          } else {
            this.historyTotal = 0;

          }
        }.bind(this)).catch(function (error) {
          alert("获取借阅历史异常");
          this.loginConfirm();
        })
      },
      getRank() {
        axios({
          url: "/cross/library/borrowInfo/getRank",
          method: "get",
          params: { //请求参数
            timeLimit: encodeURI(this.timeLimit),
          }
        }).then(function (response) {
          var data = response.data;
          this.bookRankInfo = data.bookList;
          this.userRankInfo = data.userList;
        }.bind(this)).catch(function (error) {
          alert("获取排行榜异常");
        })
      },
      isReturned(row) {
        return row.returned !== 1;
      },
      handleClick() {
        if (this.activeName == "first") {
          this.searchBook();
        }
        if (this.activeName == "second") {
          this.getBorrowHistory();
        }
        if (this.activeName == "third") {
          this.getRank();
        }
      }
      ,
      borrowBook(e, index, row) {
        var button = e.currentTarget;
        button.disabled = true;
        setTimeout(() => {
          button.disabled = false;
        }, 3000);
        axios({
          url: "/cross/library/book/borrowBook",
          method: "post",
          data: qs.stringify({bookId: row.bookId}),
        }).then(function (response) {
          var data = response.data;
          if (data === 0) {
            this.$message({
              showClose: true,
              message: '借书成功',
              type: 'success'
            });
            this.searchBook();
          }
          if (data === -2) {
            this.$message({
              showClose: true,
              message: '书籍库存不足，无法借阅',
              type: 'warning'
            });
          }
        }.bind(this)).catch(function (error) {
          alert("借书异常");
        })
      }
      ,
      canBeBorrowed(row) {
        return row.rest > 0;
      }
      ,
      canBeRenewed(row) {
        return row.returned === 0 && row.renewed === 0;
      }
      ,
      returnBook(e, index, row) {
        var button = e.currentTarget;
        button.disabled = true;
        setTimeout(() => {
          button.disabled = false;
        }, 3000);
        axios({
          url: "/cross/library/book/returnBook",
          method: "post",
          data: qs.stringify({borrowId: row.borrowId}),
        }).then(function (response) {
          if (response.data === 0) {
            this.$message({
              showClose: true,
              message: '还书成功',
              type: 'success'
            });
            this.getBorrowHistory();
          } else if (response.data === -4) {
            this.$message({
              showClose: true,
              message: '已还书',
              type: 'warning',
            });
            this.getBorrowHistory();
          } else {
            this.$message({
              showClose: true,
              message: '还书失败',
              type: 'warning',
            });
            this.getBorrowHistory();
          }
        }.bind(this)).catch(function (error) {
          alert("还书异常");
        })
      }
    },
    created: function () {
      this.searchBook();
    }
  }
</script>
<style>
  .searchBookConditionFrame {
    width: 50%;
    margin: 0 auto;
  }

  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success {
    background: oldlace;
  }

  .el-table .primary {
    background: #f0f9eb;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }

  .el-table {
    margin: 0 auto;
  }

  .selectDiv {
    margin-top: 1%;
    float: left;
    width: 50%;
  }

  .radioDiv {
    margin: 7% auto 2% auto;
  }

  .userRankDiv, .bookRankDiv {
    float: left;
    width: 48%;
    margin: 0 1%;
  }

  .pageFooter {
    margin: 0 auto;
  }
</style>
