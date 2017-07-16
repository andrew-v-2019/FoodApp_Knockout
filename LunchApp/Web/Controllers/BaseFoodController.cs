using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Services;
using Services.Interfaces;
using ViewModels.User;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace LunchApp
{
    [Route("api/[controller]")]
    public class BaseFoodController : Controller
    {
        private readonly IUserService _userService;

       
        public BaseFoodController(IUserService userService)
        {
            _userService = userService;
        }

        protected UserViewModel GetCurrentUser()
        {
            var ip = GetUserIp();
            var compName = DetermineCompName(ip);
            var user = _userService.GetByCompName(compName, ip);
            return user;

        }

        private string GetUserIp()
        {
            var remoteIpAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString();
            return remoteIpAddress;
        }

        public static string DetermineCompName(string ip)
        {
            var myIp = IPAddress.Parse(ip);
            var getIpHost = Dns.GetHostEntry(myIp);
            var compName = getIpHost.HostName.Split('.').ToList();
            return compName.First();
        }
    }
}
