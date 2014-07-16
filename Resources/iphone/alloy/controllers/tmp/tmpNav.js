function Controller() {
    function createMovieDetailOverview() {
        return Ti.UI.createView({
            width: "100%",
            height: "auto",
            backgroundGradient: {
                type: "linear",
                startPoint: {
                    x: 0,
                    y: 0
                },
                endPoint: {
                    x: 0,
                    y: "100%"
                },
                colors: [ {
                    color: "transparent",
                    offset: 0
                }, {
                    color: "#4A4A4A",
                    offset: .67
                }, {
                    color: "#4A4A4A",
                    offset: 1
                } ]
            },
            zIndex: 999,
            bottom: 0
        });
    }
    function posterPreviewScrollingCallback(e) {
        $.movieDetailWin.title = e.currentPage + 1 + " / " + e.source.views.length;
        calcPostersScrollViewPosBasedOnPreviewerCurrentPage(e.source);
    }
    function createMovieDetailOverviewTitle() {
        return Ti.UI.createLabel({
            text: "Story",
            color: "#F5A623",
            width: 288,
            height: "auto",
            top: 80,
            font: {
                fontSize: 14,
                fontWeight: "bold"
            }
        });
    }
    function createMovieDetailOverviewContent(content) {
        return Ti.UI.createLabel({
            text: content,
            width: 288,
            height: "auto",
            verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
            top: 100,
            color: "#CFCFCF",
            font: {
                fontSize: 12
            }
        });
    }
    function createMovieDetailOverviewContentShowMoreButton() {
        return Ti.UI.createButton({
            title: "show more",
            width: "auto",
            height: 12,
            color: "#F5A623",
            tintColor: "#CFCFCF",
            font: {
                fontSize: 12
            },
            right: 34,
            bottom: 15
        });
    }
    function expandMovieDetailOverviewContent() {
        var movieDetailOverview = $.movieDetailHeader.children[1];
        var movieDetailOverviewContent = movieDetailOverview.children[1];
        var movieDetailOverviewContentShowMoreButton = movieDetailOverview.children[2];
        var buttonHeight = parseInt(movieDetailOverviewContentShowMoreButton.height);
        var height = parseInt(movieDetailOverviewContent.height);
        var actualHeight = movieDetailOverviewContent._actualHeight + 5;
        if (actualHeight && actualHeight > height) {
            var diff = actualHeight - height - buttonHeight - 8;
            if (diff > 0) {
                movieDetailOverviewContent.height = actualHeight;
                movieDetailOverview.height += diff;
                $.movieDetailHeader.height += diff;
                movieDetailOverviewContentShowMoreButton.hide();
            }
        }
    }
    function renderMovieDetailTrailers(trailersUrl) {
        var views = [];
        movieDetailTrailersController = [];
        if (trailersUrl && _.isArray(trailersUrl)) {
            _.each(trailersUrl, function(url) {
                var _movieDetailTrailerController = Alloy.createController("tmp/hot/trailer", {
                    url: url
                });
                views.push(_movieDetailTrailerController.getView());
                movieDetailTrailersController.push(_movieDetailTrailerController);
            });
            $.movieDetailTrailersScrollView.add(views);
        }
    }
    function renderMovieDetailCasts(model) {
        var views = [];
        var casts = model.get("casts");
        movieDetailCastsController = [];
        if (casts && _.isArray(casts)) {
            _.each(casts, function(cast, i) {
                var _movieDetailCastController = Alloy.createController("tmp/hot/cast", {
                    avatar: model.getCastAvatars(i),
                    name: cast.name
                });
                views.push(_movieDetailCastController.getView());
                movieDetailCastsController.push(_movieDetailCastController);
            });
            $.movieDetailCastsScrollView.add(views);
        }
    }
    function renderMovieDetailPosters(postersUrl) {
        var views = [];
        movieDetailPostersController = [];
        if (postersUrl && _.isArray(postersUrl)) {
            var posterPreview = Ti.UI.createScrollableView({
                showPagingControl: false,
                width: "100%",
                height: "100%",
                backgroundColor: "transparent"
            });
            posterPreview.hide();
            $.posterPreviewCover.add(posterPreview);
            posterPreview.addEventListener("scroll", posterPreviewScrollingCallback);
            _.each(postersUrl, function(url, i) {
                var _movieDetailPosterController = Alloy.createController("tmp/hot/poster", {
                    id: i,
                    url: url,
                    previewCover: $.posterPreviewCover
                });
                views.push(_movieDetailPosterController.getView());
                movieDetailPostersController.push(_movieDetailPosterController);
            });
            $.movieDetailPostersScrollView.add(views);
        }
    }
    function renderMovieDetail(model) {
        var movieDetailOverview = createMovieDetailOverview();
        var movieDetailOverviewTitle = createMovieDetailOverviewTitle();
        var movieDetailOverviewContent = createMovieDetailOverviewContent(model.get("overview"));
        var movieDetailOverviewContentShowMoreButton = null;
        movieDetailOverview.add(movieDetailOverviewTitle);
        movieDetailOverview.add(movieDetailOverviewContent);
        $.movieDetailWin.setTitle(model.get("title"));
        $.movieDetailCover.setImage(model.getBackdropPath());
        $.movieDetailHeader.add(movieDetailOverview);
        $.movieDetailRatingNumber.setText(parseFloat(model.get("vote_average")).toFixed(1));
        $.tmpNav.open();
        var movieDetailCoverHeight = parseInt($.movieDetailCover.height);
        var movieDetailOverviewContentHeight = parseInt(movieDetailOverviewContent.toImage().height);
        var movieDetailOverviewContentExpectedHeight = 0;
        var movieDetailOverviewHeight = 0;
        if (movieDetailOverviewContent.getText() && "" !== movieDetailOverviewContent.getText() && movieDetailOverviewContentHeight) {
            movieDetailOverviewContent._actualHeight = movieDetailOverviewContentHeight;
            if (movieDetailOverviewContentHeight > 63) {
                movieDetailOverviewContentExpectedHeight = 63;
                movieDetailOverviewHeight = movieDetailOverviewContentExpectedHeight + 130;
                movieDetailOverviewContentShowMoreButton = createMovieDetailOverviewContentShowMoreButton();
                movieDetailOverview.add(movieDetailOverviewContentShowMoreButton);
                movieDetailOverviewContentShowMoreButton.addEventListener("click", expandMovieDetailOverviewContent);
            } else {
                movieDetailOverviewContentExpectedHeight = movieDetailOverviewContentHeight;
                movieDetailOverviewHeight = movieDetailOverviewContentExpectedHeight + 114;
            }
            movieDetailOverviewContent.setHeight(movieDetailOverviewContentExpectedHeight);
            movieDetailOverview.setHeight(movieDetailOverviewHeight);
            $.movieDetailHeader.setHeight(movieDetailCoverHeight + .2 * movieDetailOverviewHeight);
        } else {
            movieDetailOverview.remove(movieDetailOverviewTitle);
            movieDetailOverview.remove(movieDetailOverviewContent);
            $.movieDetailHeader.remove(movieDetailOverview);
            movieDetailOverviewTitle = null;
            movieDetailOverviewContent = null;
            movieDetailOverview = null;
        }
        Ti.App.fireEvent("hot:movie:open");
    }
    function calcPostersScrollViewPosBasedOnPreviewerCurrentPage(posterPreview) {
        if (0 === currentPoster.area) if (currentPoster.page === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * currentPoster.page, 0);
            posterBackFrame.left = 15;
        } else if (currentPoster.page + 1 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * currentPoster.page + 20, 0);
            posterBackFrame.left = 115;
        } else if (currentPoster.page + 2 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * currentPoster.page + 40, 0);
            posterBackFrame.left = 215;
        } else if (posterPreview.currentPage === posterPreview.views.length - 1) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 2) + 40, 0);
            posterBackFrame.left = 215;
        } else if (posterPreview.currentPage === posterPreview.views.length - 2) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 1) + 20, 0);
            posterBackFrame.left = 115;
        } else {
            $.movieDetailPostersScrollView.scrollTo(120 * posterPreview.currentPage, 0);
            posterBackFrame.left = 15;
        } else if (1 === currentPoster.area) if (currentPoster.page === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 1) + 20, 0);
            posterBackFrame.left = 115;
        } else if (currentPoster.page + 1 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 1) + 40, 0);
            posterBackFrame.left = 215;
        } else if (currentPoster.page - 1 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 1), 0);
            posterBackFrame.left = 15;
        } else if (posterPreview.currentPage === posterPreview.views.length - 1) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 2) + 40, 0);
            posterBackFrame.left = 215;
        } else if (posterPreview.currentPage === posterPreview.views.length - 2) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 1) + 20, 0);
            posterBackFrame.left = 115;
        } else {
            $.movieDetailPostersScrollView.scrollTo(120 * posterPreview.currentPage, 0);
            posterBackFrame.left = 15;
        } else if (2 === currentPoster.area) if (currentPoster.page === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 2) + 40, 0);
            posterBackFrame.left = 215;
        } else if (currentPoster.page - 1 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 2) + 20, 0);
            posterBackFrame.left = 115;
        } else if (currentPoster.page - 2 === posterPreview.currentPage) {
            $.movieDetailPostersScrollView.scrollTo(120 * (currentPoster.page - 2), 0);
            posterBackFrame.left = 15;
        } else if (posterPreview.currentPage === posterPreview.views.length - 1) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 2) + 40, 0);
            posterBackFrame.left = 215;
        } else if (posterPreview.currentPage === posterPreview.views.length - 2) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 1) + 20, 0);
            posterBackFrame.left = 115;
        } else {
            $.movieDetailPostersScrollView.scrollTo(120 * posterPreview.currentPage, 0);
            posterBackFrame.left = 15;
        } else if (posterPreview.currentPage === posterPreview.views.length - 1) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 2) + 40, 0);
            posterBackFrame.left = 215;
        } else if (posterPreview.currentPage === posterPreview.views.length - 2) {
            $.movieDetailPostersScrollView.scrollTo(120 * (posterPreview.currentPage - 1) + 20, 0);
            posterBackFrame.left = 115;
        } else {
            $.movieDetailPostersScrollView.scrollTo(120 * posterPreview.currentPage, 0);
            posterBackFrame.left = 15;
        }
    }
    function destoryMovieDetail() {
        var movieDetailOverview = $.movieDetailHeader.children[1];
        Ti.App.fireEvent("hot:movie:close");
        id = null;
        currentPoster = {
            page: -1,
            area: -1
        };
        if (movieDetailOverview) {
            var movieDetailOverviewContentShowMoreButton = movieDetailOverview.children[2];
            movieDetailOverviewContentShowMoreButton && movieDetailOverviewContentShowMoreButton.removeEventListener("click", expandMovieDetailOverviewContent);
            movieDetailOverview.removeAllChildren();
            $.movieDetailHeader.remove(movieDetailOverview);
            movieDetailOverviewContentShowMoreButton = null;
            movieDetailOverview = null;
        }
        $.movieDetailTrailersScrollView.removeAllChildren();
        _.each(movieDetailTrailersController, function(controller) {
            controller.destroy();
        });
        $.movieDetailCastsScrollView.removeAllChildren();
        _.each(movieDetailCastsController, function(controller) {
            controller.destroy();
        });
        $.movieDetailPostersScrollView.removeAllChildren();
        _.each(movieDetailPostersController, function(controller) {
            controller.destroy();
        });
        var posterPreview = $.posterPreviewCover.children[0];
        _.each(posterPreview.views, function(view) {
            posterPreview.removeView(view);
        });
        posterPreview.removeEventListener("scroll", posterPreviewScrollingCallback);
        $.posterPreviewCover.removeAllChildren();
        $.posterPreviewCover.backgroundColor = "transparent";
        $.posterPreviewCover.hide();
        $.movieDetailWin.setLeftNavButton(movieDetailBtnClose);
        movieDetailTrailersController = null;
        movieDetailCastsController = null;
        movieDetailPostersController = null;
        posterPreview = null;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "tmp/tmpNav";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.movieDetailWin = Ti.UI.createWindow({
        backgroundColor: "#4A4A4A",
        width: "100%",
        height: "100%",
        top: 0,
        barColor: "#4A4A4A",
        translucent: false,
        titleAttributes: {
            color: "#F5A623",
            font: {
                fontSize: 15
            }
        },
        id: "movieDetailWin",
        title: "Captain America"
    });
    $.__views.movieDetailWin.leftNavButton = void 0;
    $.__views.posterPreviewCover = Ti.UI.createView({
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        zIndex: 20,
        id: "posterPreviewCover"
    });
    $.__views.movieDetailWin.add($.__views.posterPreviewCover);
    var __alloyId18 = [];
    $.__views.movieDetailHeaderRow = Ti.UI.createTableViewRow({
        selectedBackgroundColor: "transparent",
        width: "100%",
        height: "auto",
        id: "movieDetailHeaderRow"
    });
    __alloyId18.push($.__views.movieDetailHeaderRow);
    $.__views.movieDetailHeader = Ti.UI.createView({
        width: "100%",
        height: "100%",
        id: "movieDetailHeader"
    });
    $.__views.movieDetailHeaderRow.add($.__views.movieDetailHeader);
    $.__views.movieDetailCover = Ti.UI.createImageView({
        width: "100%",
        height: 180,
        top: 0,
        id: "movieDetailCover"
    });
    $.__views.movieDetailHeader.add($.__views.movieDetailCover);
    $.__views.movieDetailRatingRow = Ti.UI.createTableViewRow({
        selectedBackgroundColor: "transparent",
        width: "100%",
        height: 50,
        id: "movieDetailRatingRow"
    });
    __alloyId18.push($.__views.movieDetailRatingRow);
    $.__views.movieDetailRating = Ti.UI.createView({
        width: "auto",
        height: "100%",
        left: 15,
        id: "movieDetailRating"
    });
    $.__views.movieDetailRatingRow.add($.__views.movieDetailRating);
    $.__views.movieDetailRatingTitle = Ti.UI.createLabel({
        color: "#F5A623",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        left: 0,
        id: "movieDetailRatingTitle",
        text: "Rating"
    });
    $.__views.movieDetailRating.add($.__views.movieDetailRatingTitle);
    $.__views.movieDetailRatingIMDB = Ti.UI.createImageView({
        width: "auto",
        height: 20,
        left: 60,
        id: "movieDetailRatingIMDB",
        image: "imdb.png"
    });
    $.__views.movieDetailRating.add($.__views.movieDetailRatingIMDB);
    $.__views.movieDetailRatingNumber = Ti.UI.createLabel({
        color: "#CFCFCF",
        font: {
            fontSize: 12,
            fontWeight: "bold"
        },
        left: 110,
        id: "movieDetailRatingNumber"
    });
    $.__views.movieDetailRating.add($.__views.movieDetailRatingNumber);
    $.__views.movieDetailTrailersRow = Ti.UI.createTableViewRow({
        selectedBackgroundColor: "transparent",
        width: "100%",
        height: 154,
        id: "movieDetailTrailersRow"
    });
    __alloyId18.push($.__views.movieDetailTrailersRow);
    $.__views.movieDetailTrailers = Ti.UI.createView({
        width: "auto",
        height: "100%",
        left: 0,
        id: "movieDetailTrailers"
    });
    $.__views.movieDetailTrailersRow.add($.__views.movieDetailTrailers);
    $.__views.movieDetailTrailersTitle = Ti.UI.createLabel({
        color: "#F5A623",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        left: 15,
        top: 14,
        id: "movieDetailTrailersTitle",
        text: "Trailers"
    });
    $.__views.movieDetailTrailers.add($.__views.movieDetailTrailersTitle);
    $.__views.movieDetailTrailersScrollView = Ti.UI.createScrollView({
        width: "auto",
        height: 113,
        layout: "horizontal",
        left: 8,
        top: 30,
        backgroundColor: "transparent",
        id: "movieDetailTrailersScrollView"
    });
    $.__views.movieDetailTrailers.add($.__views.movieDetailTrailersScrollView);
    $.__views.movieDetailCastsRow = Ti.UI.createTableViewRow({
        selectedBackgroundColor: "transparent",
        width: "100%",
        height: 154,
        id: "movieDetailCastsRow"
    });
    __alloyId18.push($.__views.movieDetailCastsRow);
    $.__views.movieDetailCasts = Ti.UI.createView({
        width: "auto",
        height: "100%",
        left: 0,
        id: "movieDetailCasts"
    });
    $.__views.movieDetailCastsRow.add($.__views.movieDetailCasts);
    $.__views.movieDetailCastsTitle = Ti.UI.createLabel({
        color: "#F5A623",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        left: 15,
        top: 14,
        id: "movieDetailCastsTitle",
        text: "Cast"
    });
    $.__views.movieDetailCasts.add($.__views.movieDetailCastsTitle);
    $.__views.movieDetailCastsScrollView = Ti.UI.createScrollView({
        width: "auto",
        height: 113,
        layout: "horizontal",
        left: 5,
        top: 25,
        backgroundColor: "transparent",
        id: "movieDetailCastsScrollView"
    });
    $.__views.movieDetailCasts.add($.__views.movieDetailCastsScrollView);
    $.__views.movieDetailPostersRow = Ti.UI.createTableViewRow({
        selectedBackgroundColor: "transparent",
        width: "100%",
        height: 216,
        id: "movieDetailPostersRow"
    });
    __alloyId18.push($.__views.movieDetailPostersRow);
    $.__views.movieDetailPosters = Ti.UI.createView({
        width: "auto",
        height: "100%",
        left: 0,
        id: "movieDetailPosters"
    });
    $.__views.movieDetailPostersRow.add($.__views.movieDetailPosters);
    $.__views.movieDetailPostersTitle = Ti.UI.createLabel({
        color: "#F5A623",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        left: 15,
        top: 14,
        id: "movieDetailPostersTitle",
        text: "Posters"
    });
    $.__views.movieDetailPosters.add($.__views.movieDetailPostersTitle);
    $.__views.movieDetailPostersScrollView = Ti.UI.createScrollView({
        width: "auto",
        height: 174,
        layout: "horizontal",
        left: 5,
        top: 34,
        backgroundColor: "transparent",
        id: "movieDetailPostersScrollView"
    });
    $.__views.movieDetailPosters.add($.__views.movieDetailPostersScrollView);
    $.__views.movieDetailTable = Ti.UI.createTableView({
        backgroundColor: "transparent",
        separatorColor: "#979797",
        data: __alloyId18,
        id: "movieDetailTable"
    });
    $.__views.movieDetailWin.add($.__views.movieDetailTable);
    $.__views.tmpNav = Ti.UI.iOS.createNavigationWindow({
        backgroundColor: "#4A4A4A",
        width: "100%",
        top: "100%",
        window: $.__views.movieDetailWin,
        id: "tmpNav"
    });
    $.__views.tmpNav && $.addTopLevelView($.__views.tmpNav);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var Animator = require("com.animecyc.animator");
    var Fader = require("alloy/animation");
    var movieDetailCollection = Alloy.Collections.instance("movieDetail");
    var movieDetailTrailersController = null;
    var movieDetailCastsController = null;
    var movieDetailPostersController = null;
    var id = null;
    var currentPoster = {
        page: -1,
        area: -1
    };
    var posterBackFrame = {
        width: 100,
        height: 150,
        left: 15,
        top: 285
    };
    var movieDetailBtnClose = Ti.UI.createButton({
        backgroundImage: "/movieDetailBtnClose.png",
        width: 16.5,
        height: 16.5
    });
    var movieDetailBtnClosePosterPreview = Ti.UI.createButton({
        backgroundImage: "/back.png",
        width: 10,
        height: 19
    });
    $.movieDetailWin.setLeftNavButton(movieDetailBtnClose);
    $.tmpNav.height = Ti.Platform.displayCaps.platformHeight - 69;
    $.posterPreviewCover.hide();
    Ti.App.addEventListener("hot:movie:prepare:open", function(param) {
        id = param.id;
        if (movieDetailCollection.get(id)) renderMovieDetail(movieDetailCollection.get(id)); else {
            var movieDetailModel = Alloy.createModel("movieDetail", {
                id: id
            });
            movieDetailCollection.add(movieDetailModel);
            movieDetailModel.getInfo(function() {
                var self = this;
                renderMovieDetail(self);
                self.getTrailers(function() {
                    renderMovieDetailTrailers(self.getTrailerUrl());
                }, function(err) {
                    alert("get trailers error " + err);
                });
                self.getCasts(function() {
                    renderMovieDetailCasts(self);
                }, function(err) {
                    alert("get cast error " + err);
                });
                self.getPosters(function() {
                    renderMovieDetailPosters(self.getPosterPath());
                }, function(err) {
                    alert("get posters error " + err);
                });
            }, function(err) {
                alert("get info error " + err);
            });
        }
    });
    Ti.App.addEventListener("hot:movie:open:poster:preview", function(e) {
        var posterPreview = $.posterPreviewCover.children[0];
        currentPoster.page = posterPreview.getCurrentPage();
        currentPoster.area = e.area;
        Fader.fadeOut(movieDetailBtnClose, 300, function() {
            $.movieDetailWin.setLeftNavButton(movieDetailBtnClosePosterPreview);
            Fader.fadeOut(movieDetailBtnClosePosterPreview, 1, function() {
                Fader.fadeIn(movieDetailBtnClosePosterPreview, 300);
            });
        });
        $.movieDetailWin.title = currentPoster.page + 1 + " / " + posterPreview.views.length;
        calcPostersScrollViewPosBasedOnPreviewerCurrentPage(posterPreview);
    });
    movieDetailBtnClosePosterPreview.addEventListener("touchend", function() {
        var posterPreview = $.posterPreviewCover.children[0];
        Fader.fadeOut(movieDetailBtnClosePosterPreview, 300, function() {
            $.movieDetailWin.setLeftNavButton(movieDetailBtnClose);
            Fader.fadeOut(movieDetailBtnClose, 1, function() {
                Fader.fadeIn(movieDetailBtnClose, 300);
            });
        });
        $.movieDetailWin.title = movieDetailCollection.get(id).get("title");
        var tmp = Ti.UI.createView(_.clone(posterPreview.views[parseInt(posterPreview.getCurrentPage())]));
        $.posterPreviewCover.add(tmp);
        posterPreview.hide();
        Animator.animate($.posterPreviewCover, {
            duration: 280,
            easing: Animator.EXP_OUT,
            backgroundColor: "transparent"
        });
        Animator.animate(tmp, {
            duration: 400,
            easing: Animator.EXP_OUT,
            width: posterBackFrame.width,
            height: posterBackFrame.height,
            left: posterBackFrame.left,
            top: posterBackFrame.top
        }, function() {
            $.posterPreviewCover.remove(tmp);
            tmp = null;
            $.posterPreviewCover.hide();
        });
    });
    movieDetailBtnClose.addEventListener("touchend", function() {
        destoryMovieDetail();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;