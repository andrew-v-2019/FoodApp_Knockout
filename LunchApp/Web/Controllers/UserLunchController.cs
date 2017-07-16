﻿using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using ViewModels.UserLunch;


namespace LunchApp
{
    [Route("api/[controller]")]
    public class UserLunchController : BaseFoodController
    {
        private readonly IUserLunchService _userLunchService;
        private readonly IUserService _userService;
        public UserLunchController(IUserService userService, IUserLunchService userLunchService) : base(userService)
        {
            _userLunchService = userLunchService;
            _userService = userService;
        }

        [HttpGet("get")]
        public UserLunchViewModel Get()
        {
            var user = GetCurrentUser();
            var userLunchModel = _userLunchService.GetCurrentLunch(user.Id);
            userLunchModel.User = user;
            return userLunchModel;
        }

        [HttpPost("update")]
        public IActionResult Update([FromBody] UserLunchViewModel model)
        {

            var user = _userService.UpdateUser(model.User);
            model.User = user;
            return Ok(null);
        }


    }
}
